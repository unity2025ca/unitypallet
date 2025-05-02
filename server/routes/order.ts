import express, { Request, Response } from 'express';
import { storage } from '../storage';
import { InsertOrder, InsertOrderItem } from '@shared/schema';
import { authenticateCustomer } from '../middleware/auth.js';
import fetch from 'node-fetch';

const router = express.Router();

// Get all orders for a customer
router.get('/', authenticateCustomer, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const customerId = req.user.id;
    const orders = await storage.getOrdersByCustomerId(customerId);
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create a new order
router.post('/', authenticateCustomer, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const customerId = req.user.id;
    // Get the cart from the cart API endpoint
    const response = await fetch(`http://localhost:5000/api/cart`, {
      headers: {
        Cookie: req.headers.cookie || ''
      }
    });
    
    if (!response.ok) {
      return res.status(400).json({ error: 'Failed to fetch cart' });
    }
    
    const cart = await response.json();
    
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Extract data from request
    const { 
      fullName, 
      email, 
      phone, 
      address, 
      city, 
      province, 
      postalCode, 
      country,
      notes,
      paymentMethod,
      shippingCost
    } = req.body;
    
    // Create order - store province and contact info in the address field to maintain compatibility
    const fullAddress = `${address}, ${city}, ${province}, ${postalCode}, ${country}`;
    const contactInfo = `Contact: ${fullName}, ${email}, ${phone}`;
    
    // Calculate total including shipping cost
    const cartTotal = cart.total || 0;
    const finalShippingCost = shippingCost || 0;
    const orderTotal = cartTotal + finalShippingCost;
    
    console.log('Order creation details:');
    console.log('Cart total:', cartTotal);
    console.log('Shipping cost:', finalShippingCost);
    console.log('Final order total (with shipping):', orderTotal);
    
    // Create order with only the fields we know exist in the database - don't use InsertOrder type
    const orderData = {
      userId: customerId,
      total: orderTotal, // Total now includes shipping cost
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress: `${fullAddress}. ${contactInfo}`,
      shippingCity: city,
      shippingPostalCode: postalCode,
      shippingCountry: country,
      shippingCost: finalShippingCost,
      notes: notes ? `${notes}. Payment: ${paymentMethod || 'cash_on_delivery'}` : `Payment: ${paymentMethod || 'cash_on_delivery'}`
    };
    
    const order = await storage.createOrder(orderData);
    
    // Create order items
    const cartItems = Array.isArray(cart.items) ? cart.items : [];
    for (const item of cartItems) {
      if (item && item.productId && item.quantity && item.product && item.product.price) {
        // Don't use InsertOrderItem type to avoid schema issues
        const orderItem = {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          pricePerUnit: item.product.price
        };
        
        await storage.createOrderItem(orderItem);
      }
    }
    
    // Clear the cart by calling the cart DELETE endpoint
    await fetch(`http://localhost:5000/api/cart/clear`, {
      method: 'DELETE',
      headers: {
        Cookie: req.headers.cookie || '',
        'Content-Type': 'application/json'
      }
    });
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get a specific order
router.get('/:id', authenticateCustomer, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const orderId = Number(req.params.id);
    const customerId = req.user.id;
    
    // Get the order
    const order = await storage.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if this order belongs to the authenticated customer
    if (order.userId !== customerId) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }
    
    // Get order items
    const orderItems = await storage.getOrderItemsByOrderId(orderId);
    
    // Return order with items
    res.json({
      ...order,
      items: orderItems
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get order items for a specific order 
router.get('/:id/items', authenticateCustomer, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const orderId = Number(req.params.id);
    const customerId = req.user.id;
    
    // Get the order
    const order = await storage.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if this order belongs to the authenticated customer
    if (order.userId !== customerId) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }
    
    // Get order items
    const orderItems = await storage.getOrderItemsByOrderId(orderId);
    
    // Return order items
    res.json(orderItems);
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ error: 'Failed to fetch order items' });
  }
});

// Admin routes - for future use
// Cancel an order (admin)
router.patch('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    
    // Get the order
    const order = await storage.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update order status
    const updatedOrder = await storage.updateOrderStatus(orderId, 'cancelled');
    
    // Return updated order
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Update order status (admin)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Get the order
    const order = await storage.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update order status
    const updatedOrder = await storage.updateOrderStatus(orderId, status);
    
    // Get order items
    const orderItems = await storage.getOrderItemsByOrderId(orderId);
    
    // Return updated order with items
    res.json({
      ...updatedOrder,
      items: orderItems
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Update payment status (admin)
router.patch('/:id/payment', async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { paymentStatus } = req.body;
    
    // Validate payment status
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }
    
    // Get the order
    const order = await storage.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update payment status
    const updatedOrder = await storage.updateOrderPaymentStatus(orderId, paymentStatus);
    
    // Return updated order
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

export default router;