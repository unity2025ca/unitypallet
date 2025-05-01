import { Request, Response, Router } from "express";
import { db } from "../db";
import { carts, cartItems, orders, orderItems, products } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

// Middleware to ensure user is authenticated
function requireCustomer(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user.roleType === "customer") {
    return next();
  }
  return res.status(401).json({ error: "Authentication required" });
}

// Get orders for current user
router.get("/", requireCustomer, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch all orders for this user
    const userOrders = await db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    
    // For each order, fetch order items with product details
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db.select({
          id: orderItems.id,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          pricePerUnit: orderItems.pricePerUnit,
          product: {
            title: products.title,
            titleAr: products.titleAr,
            imageUrl: products.imageUrl
          }
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id))
        .innerJoin(products, eq(orderItems.productId, products.id));
        
        return {
          ...order,
          items
        };
      })
    );
    
    res.json(ordersWithItems);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get specific order details
router.get("/:orderId", requireCustomer, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    
    // Fetch the order
    const [order] = await db.select()
      .from(orders)
      .where(
        and(
          eq(orders.id, parseInt(orderId)),
          eq(orders.userId, userId)
        )
      );
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    // Fetch order items with product details
    const items = await db.select({
      id: orderItems.id,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      pricePerUnit: orderItems.pricePerUnit,
      product: {
        id: products.id,
        title: products.title,
        titleAr: products.titleAr,
        imageUrl: products.imageUrl
      }
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .innerJoin(products, eq(orderItems.productId, products.id));
    
    res.json({
      ...order,
      items
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// Create a new order from cart
router.post("/", requireCustomer, async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, shippingCity, shippingPostalCode, shippingCountry, notes } = req.body;
    
    // Find user's cart
    const [userCart] = await db.select()
      .from(carts)
      .where(eq(carts.userId, userId));
    
    if (!userCart) {
      return res.status(404).json({ error: "Cart not found" });
    }
    
    // Get cart items with product details
    const cartItemsWithProducts = await db.select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      product: {
        id: products.id,
        price: products.price,
        status: products.status
      }
    })
    .from(cartItems)
    .where(eq(cartItems.cartId, userCart.id))
    .innerJoin(products, eq(cartItems.productId, products.id));
    
    if (cartItemsWithProducts.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    
    // Check if any product is sold out
    const soldOutProduct = cartItemsWithProducts.find(item => item.product.status === "soldout");
    if (soldOutProduct) {
      return res.status(400).json({ 
        error: "Some products are no longer available",
        productId: soldOutProduct.productId 
      });
    }
    
    // Calculate total
    const total = cartItemsWithProducts.reduce(
      (sum, item) => sum + (item.product.price * item.quantity), 
      0
    );
    
    // Create order
    const [newOrder] = await db.insert(orders)
      .values({
        userId,
        total,
        shippingAddress,
        shippingCity,
        shippingPostalCode,
        shippingCountry,
        notes,
        status: "pending",
        paymentStatus: "pending"
      })
      .returning();
    
    // Create order items
    await Promise.all(
      cartItemsWithProducts.map(item => 
        db.insert(orderItems)
          .values({
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            pricePerUnit: item.product.price
          })
      )
    );
    
    // Clear cart
    await db.delete(cartItems)
      .where(eq(cartItems.cartId, userCart.id));
    
    // Return the new order with items
    const orderItems = await db.select({
      id: orderItems.id,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      pricePerUnit: orderItems.pricePerUnit,
      product: {
        id: products.id,
        title: products.title,
        titleAr: products.titleAr,
        imageUrl: products.imageUrl
      }
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, newOrder.id))
    .innerJoin(products, eq(orderItems.productId, products.id));
    
    res.status(201).json({
      ...newOrder,
      items: orderItems
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Cancel an order
router.post("/:orderId/cancel", requireCustomer, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    
    // Find the order
    const [order] = await db.select()
      .from(orders)
      .where(
        and(
          eq(orders.id, parseInt(orderId)),
          eq(orders.userId, userId)
        )
      );
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    // Check if order can be cancelled
    if (order.status !== "pending") {
      return res.status(400).json({ 
        error: "Cannot cancel order",
        message: "Only pending orders can be cancelled"
      });
    }
    
    // Update order status
    const [updatedOrder] = await db.update(orders)
      .set({ status: "cancelled" })
      .where(eq(orders.id, parseInt(orderId)))
      .returning();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

export default router;