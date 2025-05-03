import { storage } from '../storage';
import { db } from '../db';
import { orders, orderStatusEnum, paymentStatusEnum } from '@shared/schema';
import { eq, and, lt } from 'drizzle-orm';

/**
 * Cleanup job for handling abandoned orders and payment intents
 * This job performs the following tasks:
 * 1. Finds orders in "pending" status with "pending" payment status that are older than a threshold
 * 2. Marks these orders as "cancelled" with "failed" payment status
 */
export async function cleanupAbandonedOrders() {
  try {
    console.log('Running abandoned order cleanup job');

    // Define threshold - orders pending for more than 1 hour
    const thresholdTime = new Date();
    thresholdTime.setHours(thresholdTime.getHours() - 1);

    // Find abandoned pending orders
    const abandonedOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.status, "pending"),
          eq(orders.paymentStatus, "pending"),
          lt(orders.createdAt, thresholdTime)
        )
      );

    console.log(`Found ${abandonedOrders.length} abandoned orders to clean up`);

    // Update each abandoned order
    for (const order of abandonedOrders) {
      try {
        await storage.updateOrderStatus(order.id, "cancelled");
        await storage.updateOrderPaymentStatus(order.id, "failed");
        
        console.log(`Cleaned up abandoned order #${order.id} (created at ${order.createdAt})`);
      } catch (error) {
        console.error(`Error cleaning up order #${order.id}:`, error);
      }
    }

    return abandonedOrders.length;
  } catch (error) {
    console.error('Error in abandoned order cleanup job:', error);
    throw error;
  }
}

/**
 * Schedule the cleanup job to run periodically
 * @param intervalMinutes How often to run the job in minutes
 */
export function scheduleOrderCleanupJob(intervalMinutes: number = 15) {
  console.log(`Scheduling abandoned order cleanup job to run every ${intervalMinutes} minutes`);
  
  // Initial run after 1 minute
  setTimeout(() => {
    cleanupAbandonedOrders().catch(err => {
      console.error('Error in initial abandoned order cleanup job:', err);
    });
  }, 60 * 1000);

  // Recurring runs
  setInterval(() => {
    cleanupAbandonedOrders().catch(err => {
      console.error('Error in scheduled abandoned order cleanup job:', err);
    });
  }, intervalMinutes * 60 * 1000);
}