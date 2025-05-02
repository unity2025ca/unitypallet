import express, { Request, Response } from 'express';
import { requireAdmin } from '../middleware/auth';

const router = express.Router();

// Test sending notifications for an order
router.post('/test-order-notifications/:orderId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    // Import dynamically to avoid circular dependencies
    const { sendOrderConfirmationNotifications } = await import('../notifications/order-notifications');
    
    // Send notifications
    console.log(`Admin requested test notifications for order #${orderId}`);
    const result = await sendOrderConfirmationNotifications(orderId);
    
    // Return result
    res.json({
      success: true,
      emailSent: result.emailSent,
      smsSent: result.smsSent,
      message: `Notifications ${result.emailSent || result.smsSent ? 'sent' : 'failed'} for order #${orderId}`
    });
  } catch (error: any) {
    console.error('Error sending test notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Unknown error'
    });
  }
});

export default router;