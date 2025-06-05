import { Request, Response, Router } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "../storage";
import { customerRegistrationSchema, loginSchema } from "@shared/schema";
import { db, pool } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();
const scryptAsync = promisify(scrypt);

// Helper function for password hashing
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Helper function for password comparison
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Get current customer
router.get("/", (req, res) => {
  // Check if user is authenticated and is a customer
  if (req.isAuthenticated() && req.user.roleType === "customer") {
    return res.json(req.user);
  }
  return res.status(401).json({ error: "Not authenticated as customer" });
});

// Customer registration
router.post("/register", async (req, res) => {
  try {
    // Validate request body
    const validationResult = customerRegistrationSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validationResult.error.format() 
      });
    }
    
    const { username, password, confirmPassword, email, fullName, phone } = req.body;
    
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords don't match" });
    }

    // Check if username is already taken
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }
    
    // Extract address fields from request
    const { address, city, postalCode, country } = req.body;
    
    // Create the new customer
    const hashedPassword = await hashPassword(password);
    const newUser = await storage.createUser({
      username,
      password: hashedPassword,
      email,
      fullName,
      phone,
      address,
      city,
      postalCode,
      country,
      roleType: "customer",
      isAdmin: false,
    });
    
    // Log in the new user
    req.login(newUser, (err) => {
      if (err) {
        return res.status(500).json({ error: "Login failed after registration" });
      }
      return res.status(201).json(newUser);
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// Customer login
router.post("/login", async (req, res, next) => {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validationResult.error.format() 
      });
    }
    
    const { username, password } = req.body;
    
    // Find the user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    
    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    
    // Log in the user
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json(user);
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed" });
  }
});

// Customer logout
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    return res.json({ success: true });
  });
});

// Update customer profile
router.patch("/profile", async (req, res) => {
  try {
    // Check if user is authenticated and is a customer
    if (!req.isAuthenticated() || req.user.roleType !== "customer") {
      return res.status(401).json({ error: "Not authenticated as customer" });
    }

    const { fullName, email, phone, address, city, postalCode, country } = req.body;
    
    // Create an object with only the fields that were provided
    const updateData: any = {};
    if (fullName !== undefined) updateData.full_name = fullName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (postalCode !== undefined) updateData.postal_code = postalCode;
    if (country !== undefined) updateData.country = country;
    
    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }
    
    try {
      // Update the user in the database using parameterized query
      const updateFields = Object.keys(updateData).map((key, i) => `${key} = $${i + 2}`).join(", ");
      const values = [req.user.id, ...Object.values(updateData)];
      
      const result = await pool.query(
        `UPDATE users SET ${updateFields} WHERE id = $1 RETURNING *`,
        values
      );
      
      if (result.rows && result.rows.length > 0) {
        // Update the session with the new user data
        const updatedUser = result.rows[0];
        req.login(updatedUser, (err) => {
          if (err) {
            return res.status(500).json({ error: "Failed to update session" });
          }
          return res.json(updatedUser);
        });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } catch (dbError) {
      console.error("Database update error:", dbError);
      return res.status(500).json({ error: "Failed to update profile" });
    }
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ error: "Profile update failed" });
  }
});

// Get customer orders
router.get("/orders", async (req, res) => {
  try {
    // Check if user is authenticated and is a customer
    if (!req.isAuthenticated() || req.user.roleType !== "customer") {
      return res.status(401).json({ error: "Not authenticated as customer" });
    }

    try {
      // Use raw SQL directly with parameterized query to avoid schema issues and SQL injection
      const result = await pool.query(
        `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
        [req.user.id]
      );
      
      const orders = result.rows || [];
      
      // If we have orders, get the items for each order
      if (orders.length > 0) {
        // Fetch order items for each order
        for (const order of orders) {
          try {
            const itemsResult = await pool.query(
              `SELECT oi.*, p.title, p.price FROM order_items oi 
               JOIN products p ON oi.product_id = p.id 
               WHERE oi.order_id = $1`,
              [order.id]
            );
            order.items = itemsResult.rows || [];
          } catch (itemError) {
            console.error(`Error fetching items for order ${order.id}:`, itemError);
            order.items = [];
          }
        }
      }
      
      // Return orders
      return res.json(orders);
    } catch (sqlError) {
      console.error("Database query error:", sqlError);
      
      // Fallback to direct DB storage method
      try {
        const userOrders = await storage.getOrdersByCustomerId(req.user.id);
        return res.json(userOrders || []);
      } catch (storageError) {
        console.error("Storage fallback error:", storageError);
        return res.status(500).json({ error: "Failed to fetch orders" });
      }
    }
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get specific customer order
router.get("/orders/:id", async (req, res) => {
  try {
    // Check if user is authenticated and is a customer
    if (!req.isAuthenticated() || req.user.roleType !== "customer") {
      return res.status(401).json({ error: "Not authenticated as customer" });
    }

    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    // Get specific order with items - using raw SQL with proper parameterized queries
    const orderResults = await pool.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [orderId, req.user.id]
    );

    if (!orderResults.rows || orderResults.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderResults.rows[0];

    // Get order items
    const orderItemsResults = await pool.query(
      `SELECT oi.*, p.title, p.price, p.image_url FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [orderId]
    );

    order.items = orderItemsResults.rows || [];

    return res.json(order);
  } catch (error) {
    console.error("Error fetching customer order:", error);
    return res.status(500).json({ error: "Failed to fetch order details" });
  }
});

export default router;