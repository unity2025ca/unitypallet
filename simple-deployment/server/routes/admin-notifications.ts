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

// Test notification services directly
router.post('/test-services', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one of email or phone must be provided'
      });
    }
    
    // Import test service
    const { testNotificationServices } = await import('../notifications/test');
    
    console.log(`Admin requested service test. Email: ${email || 'Not provided'}, Phone: ${phone || 'Not provided'}`);
    
    // Run tests and get results
    const result = await testNotificationServices(email, phone);
    
    // Return results
    res.json({
      success: true,
      results: result,
      message: 'Notification service test completed'
    });
  } catch (error: any) {
    console.error('Error testing notification services:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Unknown error'
    });
  }
});

export default router;