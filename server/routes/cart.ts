import { Request, Response, Router } from "express";
import { db } from "../db";
import { storage } from "../storage";
import { cartItems, carts, products } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";

const router = Router();

// Middleware to ensure cart exists for the current session/user
async function ensureCartExists(req: Request, res: Response, next: Function) {
  try {
    // For authenticated users, find cart by user ID
    if (req.isAuthenticated()) {
      const userId = req.user.id;
      
      // Check if user already has a cart
      const [existingCart] = await db.select()
        .from(carts)
        .where(eq(carts.userId, userId));
      
      if (existingCart) {
        req.cartId = existingCart.id;
        return next();
      }
      
      // Create a new cart for the user
      const [newCart] = await db.insert(carts)
        .values({ userId })
        .returning();
      
      req.cartId = newCart.id;
      return next();
    }
    
    // For non-authenticated users, use session-based cart
    // First, ensure we have a session ID for anonymous carts
    if (!req.session.cartSessionId) {
      req.session.cartSessionId = randomBytes(16).toString("hex");
    }
    
    const sessionId = req.session.cartSessionId;
    
    // Check if session already has a cart
    const [existingCart] = await db.select()
      .from(carts)
      .where(eq(carts.sessionId, sessionId));
    
    if (existingCart) {
      req.cartId = existingCart.id;
      return next();
    }
    
    // Create a new cart for the session
    const [newCart] = await db.insert(carts)
      .values({ sessionId })
      .returning();
    
    req.cartId = newCart.id;
    return next();
  } catch (error) {
    console.error("Error ensuring cart exists:", error);
    return res.status(500).json({ error: "Failed to process cart" });
  }
}

// Get cart items
router.get("/", ensureCartExists, async (req, res) => {
  try {
    // Query cart items with product details
    const items = await db.select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      product: {
        id: products.id,
        title: products.title,
        titleAr: products.titleAr,
        price: products.price,
        imageUrl: products.imageUrl,
        status: products.status
      }
    })
    .from(cartItems)
    .where(eq(cartItems.cartId, req.cartId))
    .innerJoin(products, eq(cartItems.productId, products.id));
    
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    res.json({
      items,
      total,
      itemCount: items.length
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Add item to cart
router.post("/items", ensureCartExists, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }
    
    // Validate product exists and is available
    const [product] = await db.select()
      .from(products)
      .where(eq(products.id, productId));
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    if (product.status === "soldout") {
      return res.status(400).json({ error: "Product is sold out" });
    }
    
    // Check if product is already in cart
    const [existingItem] = await db.select()
      .from(cartItems)
      .where(and(
        eq(cartItems.cartId, req.cartId),
        eq(cartItems.productId, productId)
      ));
    
    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db.update(cartItems)
        .set({ quantity: existingItem.quantity + quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      
      return res.json(updatedItem);
    }
    
    // Add new item
    const [newItem] = await db.insert(cartItems)
      .values({
        cartId: req.cartId,
        productId,
        quantity
      })
      .returning();
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
});

// Update cart item quantity
router.patch("/items/:itemId", ensureCartExists, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }
    
    // Verify item belongs to this cart
    const [cartItem] = await db.select()
      .from(cartItems)
      .where(and(
        eq(cartItems.id, parseInt(itemId)),
        eq(cartItems.cartId, req.cartId)
      ));
    
    if (!cartItem) {
      return res.status(404).json({ error: "Item not found in cart" });
    }
    
    // Update quantity
    const [updatedItem] = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, parseInt(itemId)))
      .returning();
    
    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ error: "Failed to update cart item" });
  }
});

// Remove item from cart
router.delete("/items/:itemId", ensureCartExists, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Verify item belongs to this cart
    const [cartItem] = await db.select()
      .from(cartItems)
      .where(and(
        eq(cartItems.id, parseInt(itemId)),
        eq(cartItems.cartId, req.cartId)
      ));
    
    if (!cartItem) {
      return res.status(404).json({ error: "Item not found in cart" });
    }
    
    // Delete the item
    await db.delete(cartItems)
      .where(eq(cartItems.id, parseInt(itemId)));
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
});

// Clear cart
router.delete("/", ensureCartExists, async (req, res) => {
  try {
    // Delete all items from cart
    await db.delete(cartItems)
      .where(eq(cartItems.cartId, req.cartId));
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// Transfer anonymous cart to user (called after login)
router.post("/transfer", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Ensure we have a session cart ID
    if (!req.session.cartSessionId) {
      return res.json({ success: true, message: "No anonymous cart to transfer" });
    }
    
    const sessionId = req.session.cartSessionId;
    const userId = req.user.id;
    
    // Find anonymous cart
    const [anonymousCart] = await db.select()
      .from(carts)
      .where(eq(carts.sessionId, sessionId));
    
    if (!anonymousCart) {
      return res.json({ success: true, message: "No anonymous cart found" });
    }
    
    // Find or create user cart
    let [userCart] = await db.select()
      .from(carts)
      .where(eq(carts.userId, userId));
    
    if (!userCart) {
      [userCart] = await db.insert(carts)
        .values({ userId })
        .returning();
    }
    
    // Get items from anonymous cart
    const anonymousItems = await db.select()
      .from(cartItems)
      .where(eq(cartItems.cartId, anonymousCart.id));
    
    // Get items from user cart
    const userItems = await db.select()
      .from(cartItems)
      .where(eq(cartItems.cartId, userCart.id));
    
    // Merge cart items
    for (const item of anonymousItems) {
      const existingItem = userItems.find(i => i.productId === item.productId);
      
      if (existingItem) {
        // Update quantity if item already exists
        await db.update(cartItems)
          .set({ quantity: existingItem.quantity + item.quantity })
          .where(eq(cartItems.id, existingItem.id));
      } else {
        // Add new item to user cart
        await db.insert(cartItems)
          .values({
            cartId: userCart.id,
            productId: item.productId,
            quantity: item.quantity
          });
      }
    }
    
    // Delete anonymous cart items
    await db.delete(cartItems)
      .where(eq(cartItems.cartId, anonymousCart.id));
    
    // Delete anonymous cart
    await db.delete(carts)
      .where(eq(carts.id, anonymousCart.id));
    
    // Clear session cart ID
    delete req.session.cartSessionId;
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error transferring cart:", error);
    res.status(500).json({ error: "Failed to transfer cart" });
  }
});

export default router;