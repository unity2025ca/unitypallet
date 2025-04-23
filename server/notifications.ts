import { storage } from './storage';
import { InsertNotification } from '@shared/schema';
import { sendNotificationToAdmins, sendNotificationToPublishers, sendNotificationToUser } from './websocket';

// Create a notification for a new contact message
export async function createContactNotification(contactId: number, name: string, message: string) {
  try {
    // Get all admin users to create notifications for them
    const users = await storage.getAllUsers();
    const adminUsers = users.filter(user => user.isAdmin);
    
    const notifications = [];
    
    // Create a notification for each admin
    for (const admin of adminUsers) {
      const notificationData: InsertNotification = {
        userId: admin.id,
        type: 'new_contact',
        title: 'New Contact Message',
        message: `New message from ${name}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
        relatedId: contactId,
        isRead: false
      };
      
      // Create the notification in the database
      const notification = await storage.createNotification(notificationData);
      notifications.push(notification);
    }
    
    // Send notifications in real-time
    if (notifications.length > 0) {
      // We just use the first notification as a template for broadcasting
      sendNotificationToAdmins(notifications[0]);
    }
    
    return { success: true, count: notifications.length };
  } catch (error) {
    console.error('Failed to create contact notification:', error);
    return { success: false, error };
  }
}

// Create a notification for a new appointment request
export async function createAppointmentNotification(appointmentId: number, name: string, date: Date) {
  try {
    // Get all staff who can manage appointments
    const users = await storage.getAllUsers();
    const staffUsers = users.filter(user => user.isAdmin || user.roleType === 'publisher');
    
    const notifications = [];
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Create a notification for each applicable staff member
    for (const staff of staffUsers) {
      const notificationData: InsertNotification = {
        userId: staff.id,
        type: 'new_appointment',
        title: 'New Appointment Request',
        message: `New appointment request from ${name} for ${formattedDate}`,
        relatedId: appointmentId,
        isRead: false
      };
      
      // Create the notification in the database
      const notification = await storage.createNotification(notificationData);
      notifications.push(notification);
      
      // Send notification directly to this user
      sendNotificationToUser(staff.id, notification);
    }
    
    // Send notifications via broadcast channels as well
    if (notifications.length > 0) {
      // First notify all admins
      sendNotificationToAdmins(notifications[0]);
      
      // Then notify all publishers who might not be admins
      sendNotificationToPublishers(notifications[0]);
      
      console.log(`Appointment notification sent to ${notifications.length} staff members`);
    }
    
    return { success: true, count: notifications.length };
  } catch (error) {
    console.error('Failed to create appointment notification:', error);
    return { success: false, error };
  }
}

// Create a notification for an appointment status change
export async function createAppointmentStatusNotification(
  appointmentId: number,
  status: string,
  userId: number,
  appointmentDate: Date
) {
  try {
    // Get all staff who can manage appointments
    const users = await storage.getAllUsers();
    const staffUsers = users.filter(user => 
      (user.isAdmin || user.roleType === 'publisher') && user.id !== userId
    );
    
    const notifications = [];
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Create a notification for each applicable staff member
    for (const staff of staffUsers) {
      const notificationData: InsertNotification = {
        userId: staff.id,
        type: 'status_update',
        title: 'Appointment Status Changed',
        message: `Appointment for ${formattedDate} status changed to ${status}`,
        relatedId: appointmentId,
        isRead: false
      };
      
      // Create the notification in the database
      const notification = await storage.createNotification(notificationData);
      notifications.push(notification);
      
      // Send notification directly to this user
      sendNotificationToUser(staff.id, notification);
    }
    
    // Send notifications via broadcast channels as well
    if (notifications.length > 0) {
      // Send to both admins and publishers
      sendNotificationToAdmins(notifications[0]);
      sendNotificationToPublishers(notifications[0]);
      
      console.log(`Appointment status notification sent to ${notifications.length} staff members`);
    }
    
    return { success: true, count: notifications.length };
  } catch (error) {
    console.error('Failed to create appointment status notification:', error);
    return { success: false, error };
  }
}