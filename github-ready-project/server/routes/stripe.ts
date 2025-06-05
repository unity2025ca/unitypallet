import { Request, Response, Router } from "express";
import Stripe from "stripe";
import { storage } from "../storage";

// Initialize Stripe with API key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required environment variable: STRIPE_SECRET_KEY");
}

// Make sure to use the secret key (should start with 'sk_')
const secretKey = process.env.STRIPE_SECRET_KEY;
console.log("Initializing Stripe with key type:", secretKey.startsWith('sk_') ? 'Secret Key' : 'Wrong Key Type');

const stripe = new Stripe(secretKey, {
  apiVersion: "2023-10-16" as any,
});

const router = Router();

// Customer authentication middleware
function requireCustomer(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user.roleType === "customer") {
    return next();
  }
  return res.status(401).json({ error: "Authentication required" });
}

// Create a payment intent for checkout
router.post("/create-payment-intent", requireCustomer, async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { amount, orderId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    
    console.log(`Creating Stripe checkout for order #${orderId} with amount: ${amount}`);
    
    // Retrieve the order to get detailed information for Stripe
    const order = await storage.getOrderById(Number(orderId));
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    // Get order items for better product description
    const orderItems = await storage.getOrderItemsByOrderId(Number(orderId));
    
    // Create a checkout session with separate line items for products and shipping
    // This will redirect the user to Stripe's hosted checkout page
    
    // Calculate product total (without shipping) and convert to cents for Stripe
    // In our system, amounts are stored as cents (e.g., 1250 means $1250.00)
    // But Stripe expects amounts in cents (e.g., 125000 means $1250.00)
    // So we need to multiply by 100
    const productTotal = order.total - order.shippingCost;
    const productTotalInCents = productTotal * 100;
    const shippingCostInCents = order.shippingCost * 100;
    
    console.log(`Original product total: ${productTotal}, converted to cents: ${productTotalInCents}`);
    console.log(`Original shipping cost: ${order.shippingCost}, converted to cents: ${shippingCostInCents}`);
    
    // Prepare line items array
    const lineItems = [];
    
    // Add product as first line item
    lineItems.push({
      price_data: {
        currency: 'cad',
        product_data: {
          name: `Order #${orderId} - ${orderItems.length} items`,
          description: `Purchase from Jaberco Pallets`,
        },
        unit_amount: productTotalInCents, // Product amount in cents
      },
      quantity: 1,
    });
    
    // Add shipping as separate line item if applicable
    if (order.shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'cad',
          product_data: {
            name: 'Shipping',
            description: 'Shipping and handling fees',
          },
          unit_amount: shippingCostInCents, // Shipping amount in cents
        },
        quantity: 1,
      });
    }
    
    console.log('Stripe checkout line items:', lineItems);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/account?order_success=true&order_id=${orderId}`,
      cancel_url: `${req.headers.origin}/checkout?canceled=true`,
      metadata: {
        orderId: orderId || "manual_checkout",
        userId: req.user.id.toString(),
      },
    });
    
    // Return the session ID
    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Error creating payment session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhook for handling events
router.post("/webhook", async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;
  
  let event;
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn("STRIPE_WEBHOOK_SECRET is not set. Webhook verification is disabled.");
    // In development, allow testing without signature verification
    event = req.body;
  } else {
    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error: any) {
      console.error("Webhook signature verification failed:", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
  
  // Handle different events
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Process successful payment
      // Update order status in the database
      if (paymentIntent.metadata.orderId && paymentIntent.metadata.orderId !== "manual_checkout") {
        try {
          const orderId = parseInt(paymentIntent.metadata.orderId);
          await storage.updateOrderPaymentStatus(orderId, "paid");
          await storage.updateOrderStatus(orderId, "processing");
          
          // Also store the payment intent ID in the order for reference
          await storage.updateOrderPaymentIntent(orderId, paymentIntent.id);
          
          console.log(`Payment for order ${orderId} succeeded. Payment ID: ${paymentIntent.id}`);
          
          // Send order confirmation notifications (email and SMS)
          const { sendOrderConfirmationNotifications } = await import('../notifications/order-notifications');
          const notificationResults = await sendOrderConfirmationNotifications(orderId);
          
          console.log(`Order confirmation notifications for order ${orderId}:`, {
            emailSent: notificationResults.emailSent,
            smsSent: notificationResults.smsSent
          });
        } catch (error) {
          console.error("Error processing successful payment:", error);
        }
      }
      break;
    
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Process completed checkout session
      if (session.metadata && session.metadata.orderId && session.metadata.orderId !== "manual_checkout") {
        try {
          const orderId = parseInt(session.metadata.orderId);
          // Update both payment status and order status
          await storage.updateOrderPaymentStatus(orderId, "paid");
          await storage.updateOrderStatus(orderId, "processing");
          
          // Also store the payment intent ID in the order for reference if available
          if (session.payment_intent) {
            await storage.updateOrderPaymentIntent(orderId, 
              typeof session.payment_intent === 'string' ? 
              session.payment_intent : 
              session.payment_intent.id
            );
          }
          
          console.log(`Checkout completed for order ${orderId}. Payment status updated to 'paid', order status updated to 'processing'. Session ID: ${session.id}`);
          
          // Send order confirmation notifications (email and SMS)
          const { sendOrderConfirmationNotifications } = await import('../notifications/order-notifications');
          const notificationResults = await sendOrderConfirmationNotifications(orderId);
          
          console.log(`Order confirmation notifications for order ${orderId}:`, {
            emailSent: notificationResults.emailSent,
            smsSent: notificationResults.smsSent
          });
        } catch (error) {
          console.error("Error processing completed checkout:", error);
        }
      }
      break;
      
    case "checkout.session.expired":
      const expiredSession = event.data.object as Stripe.Checkout.Session;
      
      // Handle expired checkout session
      if (expiredSession.metadata && expiredSession.metadata.orderId && expiredSession.metadata.orderId !== "manual_checkout") {
        try {
          const orderId = parseInt(expiredSession.metadata.orderId);
          // Update payment status to 'expired' and order status to 'cancelled'
          await storage.updateOrderPaymentStatus(orderId, "failed");
          await storage.updateOrderStatus(orderId, "cancelled");
          
          console.log(`Checkout session expired for order ${orderId}. Payment status updated to 'failed', order status updated to 'cancelled'. Session ID: ${expiredSession.id}`);
        } catch (error) {
          console.error("Error processing expired checkout:", error);
        }
      }
      break;
      
    case "payment_intent.payment_failed":
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Handle failed payment
      if (failedPaymentIntent.metadata.orderId && failedPaymentIntent.metadata.orderId !== "manual_checkout") {
        try {
          const orderId = parseInt(failedPaymentIntent.metadata.orderId);
          await storage.updateOrderPaymentStatus(orderId, "failed");
          // Also mark the order as cancelled since payment failed
          await storage.updateOrderStatus(orderId, "cancelled");
          
          // Also store the payment intent ID in the order for reference
          await storage.updateOrderPaymentIntent(orderId, failedPaymentIntent.id);
          
          console.log(`Payment failed for order ${orderId}. Order cancelled. Payment ID: ${failedPaymentIntent.id}`);
        } catch (error) {
          console.error("Error processing failed payment:", error);
        }
      }
      break;
      
    case "payment_intent.canceled":
      const canceledPaymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Handle canceled payment intent (when customer abandons checkout)
      if (canceledPaymentIntent.metadata.orderId && canceledPaymentIntent.metadata.orderId !== "manual_checkout") {
        try {
          const orderId = parseInt(canceledPaymentIntent.metadata.orderId);
          await storage.updateOrderPaymentStatus(orderId, "failed");
          await storage.updateOrderStatus(orderId, "cancelled");
          
          // Also store the payment intent ID in the order for reference
          await storage.updateOrderPaymentIntent(orderId, canceledPaymentIntent.id);
          
          console.log(`Payment intent canceled for order ${orderId}. Order cancelled. Payment ID: ${canceledPaymentIntent.id}`);
        } catch (error) {
          console.error("Error processing canceled payment intent:", error);
        }
      }
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  res.json({ received: true });
});

// Create a new customer in Stripe
router.post("/create-stripe-customer", requireCustomer, async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Check if user already has a Stripe customer ID
    if ((req.user as any).stripeCustomerId) {
      return res.status(400).json({ error: "Customer already exists in Stripe" });
    }
    
    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email: req.user.email || undefined,
      name: (req.user as any).fullName || req.user.username,
      metadata: {
        userId: req.user.id.toString(),
      },
    });
    
    // Update user with Stripe customer ID
    await storage.updateUser(req.user.id, {
      // Use any type to bypass TypeScript's property checking
      ...(customer.id ? { stripeCustomerId: customer.id } as any : {})
    });
    
    res.json({ success: true, customerId: customer.id });
  } catch (error: any) {
    console.error("Error creating Stripe customer:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;