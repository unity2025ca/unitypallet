import { Order, OrderItem } from "@shared/schema";
import { sendEmail } from "../email";
import { sendSMS } from "../sms";
import { storage } from "../storage";
import { formatCurrency } from "../utils/format";

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(
  order: Order,
  orderItems: OrderItem[],
  customerEmail: string,
  customerName: string
): Promise<boolean> {
  try {
    console.log(`Preparing to send order confirmation email to ${customerEmail} for order #${order.id}`);
    
    // Fetch product details for each order item to display product title
    const orderItemsWithProducts = await Promise.all(
      orderItems.map(async (item) => {
        const product = await storage.getProductById(item.productId);
        return {
          ...item,
          productTitle: product?.title || 'Product'
        };
      })
    );
    
    // Format order items for display in email
    const itemsList = orderItemsWithProducts.map(item => {
      const totalPrice = (item.quantity || 1) * (item.pricePerUnit || 0);
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productTitle}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">C$${formatCurrency(item.pricePerUnit || 0)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">C$${formatCurrency(totalPrice)}</td>
        </tr>
      `;
    }).join('');
    
    // Prepare email HTML content
    const emailContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-bottom: 3px solid #e50000;">
          <h1 style="color: #333; margin: 0;">Order Confirmation</h1>
        </div>
        
        <div style="padding: 20px; background-color: #fff;">
          <p>Hello ${customerName},</p>
          
          <p>Thank you for your order! We're pleased to confirm that your payment has been successfully processed.</p>
          
          <div style="background-color: #f8f8f8; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h2 style="margin-top: 0; font-size: 18px; color: #333;">Order Summary</h2>
            <p><strong>Order Number:</strong> #${order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt || new Date()).toLocaleDateString()}</p>
            <p><strong>Payment Status:</strong> Paid</p>
            <p><strong>Order Status:</strong> ${order.status || 'Processing'}</p>
          </div>
          
          <h3 style="margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px; color: #333;">Order Details</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Quantity</th>
                <th style="padding: 10px; text-align: right;">Unit Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
                <td style="padding: 10px; text-align: right;">C$${formatCurrency(order.total - (order.shippingCost || 0))}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Shipping:</td>
                <td style="padding: 10px; text-align: right;">C$${formatCurrency(order.shippingCost || 0)}</td>
              </tr>
              <tr style="background-color: #f5f5f5; font-weight: bold;">
                <td colspan="3" style="padding: 10px; text-align: right;">Total:</td>
                <td style="padding: 10px; text-align: right;">C$${formatCurrency(order.total)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <h3 style="color: #333;">Shipping Information</h3>
            <p>
              <strong>Address:</strong> ${order.shippingAddress || ''}<br>
              <strong>City:</strong> ${order.shippingCity || ''}<br>
              <strong>Postal Code:</strong> ${order.shippingPostalCode || ''}<br>
              <strong>Country:</strong> ${order.shippingCountry || ''}
            </p>
          </div>
          
          <div style="margin-top: 30px; background-color: #f8f8f8; padding: 15px; border-radius: 5px;">
            <p style="margin-top: 0;">If you have any questions about your order, please contact our customer support team.</p>
            <p style="margin-bottom: 0;">Thank you for shopping with Unity Pallets!</p>
          </div>
        </div>
        
        <div style="padding: 20px; background-color: #333; color: #fff; text-align: center; font-size: 14px;">
          <p>&copy; ${new Date().getFullYear()} Unity Pallets. All rights reserved.</p>
        </div>
      </div>
    `;
    
    // Send the email
    return await sendEmail({
      to: customerEmail,
      from: "orders@unity-pallets.com",
      subject: `Order Confirmation #${order.id} - Unity Pallets`,
      html: emailContent
    });
    
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return false;
  }
}

/**
 * Send order confirmation SMS to customer
 */
export async function sendOrderConfirmationSMS(
  order: Order,
  customerPhone: string,
  customerName: string
): Promise<{success: boolean}> {
  try {
    console.log(`Preparing to send order confirmation SMS to ${customerPhone} for order #${order.id}`);
    
    // Check if phone number is valid
    if (!customerPhone || !customerPhone.startsWith('+')) {
      console.log(`Invalid phone number ${customerPhone} for SMS. Must start with +`);
      return { success: false };
    }
    
    // Prepare SMS message
    const message = `Hello ${customerName}, your order #${order.id} with Unity Pallets has been confirmed and payment received. Total: C$${formatCurrency(order.total)}. Thank you for your purchase!`;
    
    // Send the SMS
    const result = await sendSMS(customerPhone, message);
    return result;
    
  } catch (error) {
    console.error("Error sending order confirmation SMS:", error);
    return { success: false };
  }
}

/**
 * Send both email and SMS notifications for a confirmed order
 */
export async function sendOrderConfirmationNotifications(orderId: number): Promise<{
  emailSent: boolean;
  smsSent: boolean;
}> {
  try {
    console.log(`Processing order confirmation notifications for order #${orderId}`);
    
    // Get order details
    const order = await storage.getOrderById(orderId);
    if (!order) {
      console.error(`Order #${orderId} not found when trying to send confirmation notifications`);
      return { emailSent: false, smsSent: false };
    }
    
    // Get order items
    const orderItems = await storage.getOrderItemsByOrderId(orderId);
    
    // Get customer information
    const customer = await storage.getUser(order.userId);
    if (!customer) {
      console.error(`Customer with ID ${order.userId} not found for order #${orderId}`);
      return { emailSent: false, smsSent: false };
    }
    
    // Get customer name and email
    const customerName = customer.fullName || customer.username || "Valued Customer";
    const customerEmail = customer.email;
    const customerPhone = customer.phone; // Using phone field from schema
    
    // Results
    let emailSent = false;
    let smsSent = false;
    
    // Send email if customer has email
    if (customerEmail) {
      emailSent = await sendOrderConfirmationEmail(order, orderItems, customerEmail, customerName);
      console.log(`Order confirmation email for order #${orderId} ${emailSent ? 'sent successfully' : 'failed to send'}`);
    } else {
      console.log(`Customer has no email address for order #${orderId}`);
    }
    
    // Send SMS if customer has phone number
    if (customerPhone) {
      const smsResult = await sendOrderConfirmationSMS(order, customerPhone, customerName);
      smsSent = smsResult.success;
      console.log(`Order confirmation SMS for order #${orderId} ${smsSent ? 'sent successfully' : 'failed to send'}`);
    } else {
      console.log(`Customer has no phone number for order #${orderId}`);
    }
    
    return { emailSent, smsSent };
    
  } catch (error) {
    console.error("Error in sendOrderConfirmationNotifications:", error);
    return { emailSent: false, smsSent: false };
  }
}