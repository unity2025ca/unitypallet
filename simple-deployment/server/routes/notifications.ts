import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertNotificationSchema } from '@shared/schema';
import { sendNotificationToAdmins, sendNotificationToPublishers, sendNotificationToUser } from '../websocket';

// Create a router for notifications endpoints
const router = Router();

// Middleware to ensure the user is authenticated
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Get all notifications for the authenticated user
router.get('/api/notifications', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const notifications = await storage.getNotificationsByUserId(userId);
  res.json(notifications);
});

// Get all unread notifications for the authenticated user
router.get('/api/notifications/unread', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const notifications = await storage.getUnreadNotificationsByUserId(userId);
  res.json(notifications);
});

// Mark a notification as read
router.patch('/api/notifications/:id/read', requireAuth, async (req: Request, res: Response) => {
  const notificationId = parseInt(req.params.id);
  if (isNaN(notificationId)) {
    return res.status(400).json({ error: 'Invalid notification ID' });
  }
  
  const success = await storage.markNotificationAsRead(notificationId);
  
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Notification not found' });
  }
});

// Mark all notifications as read for the authenticated user
router.post('/api/notifications/read-all', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const success = await storage.markAllNotificationsAsRead(userId);
  res.json({ success });
});

// Delete a notification
router.delete('/api/notifications/:id', requireAuth, async (req: Request, res: Response) => {
  const notificationId = parseInt(req.params.id);
  if (isNaN(notificationId)) {
    return res.status(400).json({ error: 'Invalid notification ID' });
  }
  
  const success = await storage.deleteNotification(notificationId);
  
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Notification not found' });
  }
});

// Create a new notification for a specific user (admin only)
router.post('/api/admin/notifications/user/:userId', requireAuth, async (req: Request, res: Response) => {
  // Verify that the user is an admin
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  try {
    // Validate the notification data
    const validatedData = insertNotificationSchema.parse({
      ...req.body,
      userId
    });
    
    // Create the notification in the database
    const notification = await storage.createNotification(validatedData);
    
    // Send the notification in real-time if the user is connected
    sendNotificationToUser(userId, notification);
    
    res.status(201).json(notification);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create notification' });
    }
  }
});

// Create a new notification for all admins
router.post('/api/admin/notifications/admins', requireAuth, async (req: Request, res: Response) => {
  // Verify that the user is an admin
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  try {
    // Get all admin users
    const users = await storage.getAllUsers();
    const adminUsers = users.filter(user => user.isAdmin);
    
    const notifications = [];
    
    // Create a notification for each admin
    for (const admin of adminUsers) {
      // Validate the notification data
      const validatedData = insertNotificationSchema.parse({
        ...req.body,
        userId: admin.id
      });
      
      // Create the notification in the database
      const notification = await storage.createNotification(validatedData);
      notifications.push(notification);
    }
    
    // Send notifications in real-time
    if (notifications.length > 0) {
      // We just use the first notification as a template for broadcasting
      sendNotificationToAdmins(notifications[0]);
    }
    
    res.status(201).json({ success: true, count: notifications.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create notifications' });
    }
  }
});

// Create a new notification for all publishers
router.post('/api/admin/notifications/publishers', requireAuth, async (req: Request, res: Response) => {
  // Verify that the user is an admin
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  try {
    // Get all publisher users
    const users = await storage.getAllUsers();
    const publisherUsers = users.filter(user => user.roleType === 'publisher' || user.isAdmin);
    
    const notifications = [];
    
    // Create a notification for each publisher
    for (const publisher of publisherUsers) {
      // Validate the notification data
      const validatedData = insertNotificationSchema.parse({
        ...req.body,
        userId: publisher.id
      });
      
      // Create the notification in the database
      const notification = await storage.createNotification(validatedData);
      notifications.push(notification);
    }
    
    // Send notifications in real-time
    if (notifications.length > 0) {
      // We just use the first notification as a template for broadcasting
      sendNotificationToPublishers(notifications[0]);
    }
    
    res.status(201).json({ success: true, count: notifications.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create notifications' });
    }
  }
});

export default router;