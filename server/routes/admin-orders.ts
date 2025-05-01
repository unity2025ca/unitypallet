import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { db, pool } from "../db";
import { sql } from "drizzle-orm";

const router = Router();

// Get all orders (admin)
router.get("/", async (req: Request, res: Response) => {
  try {
    // Get all orders with direct SQL to avoid schema issues
    const orders = await pool.query(
      `SELECT o.*, u.email, u.full_name, u.phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    ).then(result => result.rows);
    
    // For each order, get its items
    if (orders && orders.length > 0) {
      for (const order of orders) {
        try {
          const orderItems = await pool.query(
            `SELECT oi.*, p.title, p.price, p.image_url FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = $1`,
            [order.id]
          ).then(result => result.rows);
          order.items = orderItems || [];
        } catch (error) {
          console.error(`Error fetching items for order ${order.id}:`, error);
          order.items = [];
        }
      }
    }
    
    return res.json(orders || []);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get a specific order (admin)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }
    
    // Get the order with direct SQL to avoid schema issues
    const rows = await pool.query(
      `SELECT o.*, u.email, u.full_name, u.phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [orderId]
    ).then(result => result.rows);
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    const order = rows[0];
    
    // Get order items
    const orderItems = await pool.query(
      `SELECT oi.*, p.title, p.price, p.image_url FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [orderId]
    ).then(result => result.rows);
    
    order.items = orderItems || [];
    
    return res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// Update order status (admin)
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }
    
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    // Update with direct SQL to avoid schema issues
    const rows = await pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, orderId]
    ).then(result => result.rows);
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    // Get order items
    const orderItems = await pool.query(
      `SELECT oi.*, p.title, p.price, p.image_url FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [orderId]
    ).then(result => result.rows);
    
    const updatedOrder = rows[0];
    updatedOrder.items = orderItems || [];
    
    // TODO: Send notification to the customer about order status change
    
    return res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ error: "Failed to update order status" });
  }
});

// Update payment status (admin)
router.patch("/:id/payment-status", async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }
    
    const { paymentStatus } = req.body;
    
    // Validate payment status
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: "Invalid payment status" });
    }
    
    // Update with direct SQL to avoid schema issues
    const rows = await pool.query(
      `UPDATE orders SET payment_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [paymentStatus, orderId]
    ).then(result => result.rows);
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    // TODO: Send notification to the customer about payment status change
    
    return res.json(rows[0]);
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res.status(500).json({ error: "Failed to update payment status" });
  }
});

export default router;