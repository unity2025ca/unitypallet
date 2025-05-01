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
    
    // Create a checkout session instead of a payment intent
    // This will redirect the user to Stripe's hosted checkout page
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: `Order #${orderId}`,
              description: 'Purchase from Unity Pallets',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
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
          console.log(`Payment for order ${orderId} succeeded. Payment ID: ${paymentIntent.id}`);
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
          await storage.updateOrderPaymentStatus(orderId, "paid");
          console.log(`Checkout completed for order ${orderId}. Session ID: ${session.id}`);
        } catch (error) {
          console.error("Error processing completed checkout:", error);
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
          console.log(`Payment failed for order ${orderId}. Payment ID: ${failedPaymentIntent.id}`);
        } catch (error) {
          console.error("Error processing failed payment:", error);
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