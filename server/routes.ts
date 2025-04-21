import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertContactSchema, 
  insertSubscriberSchema, 
  insertUserSchema 
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import { z } from "zod";
import { sendBulkEmails } from "./email";
import { upload, handleUploadError } from "./upload";
import path from "path";

// Setup authentication
const setupAuth = (app: Express) => {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'unity-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    store: storage.sessionStore
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure passport to use local strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Invalid username" });
      }
      if (user.password !== password) { // In a real app, use bcrypt.compare
        return done(null, false, { message: "Invalid password" });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // Auth middleware for admin routes
  const requireAdmin = (req: Request, res: Response, next: any) => {
    if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
  
  return requireAdmin;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  const requireAdmin = setupAuth(app);
  
  // Product routes
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  
  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });
  
  // Admin product routes (protected)
  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  
  app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      // Partial validation of the request body
      const validatedData = insertProductSchema.partial().parse(req.body);
      
      const updatedProduct = await storage.updateProduct(id, validatedData);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  
  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  
  // Contact routes
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });
  
  app.get("/api/admin/contacts", requireAdmin, async (_req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });
  
  // Subscriber routes
  app.post("/api/subscribe", async (req, res) => {
    try {
      const validatedData = insertSubscriberSchema.parse(req.body);
      const subscriber = await storage.createSubscriber(validatedData);
      res.status(201).json(subscriber);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscriber data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to subscribe" });
    }
  });
  
  app.get("/api/admin/subscribers", requireAdmin, async (_req, res) => {
    try {
      const subscribers = await storage.getAllSubscribers();
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });

  // Email newsletter to subscribers
  app.post("/api/admin/subscribers/email", requireAdmin, async (req, res) => {
    try {
      console.log('Newsletter request received:', {
        hasSubject: !!req.body.subject,
        hasContent: !!req.body.content,
        isHtml: !!req.body.isHtml,
        fromEmail: req.body.fromEmail
      });
      
      const { subject, content, isHtml = false, fromEmail } = req.body;
      
      // Validate required fields
      if (!subject || !content || !fromEmail) {
        const missingFields = [];
        if (!subject) missingFields.push('subject');
        if (!content) missingFields.push('content');
        if (!fromEmail) missingFields.push('fromEmail');
        
        console.warn('Missing required newsletter fields:', missingFields);
        
        return res.status(400).json({ 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')} ${missingFields.length > 1 ? 'are' : 'is'} required` 
        });
      }
      
      // Get all subscribers
      const subscribers = await storage.getAllSubscribers();
      console.log(`Found ${subscribers.length} subscribers`);
      
      if (subscribers.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "No subscribers found to send email to" 
        });
      }
      
      // Extract emails from subscribers
      const emails = subscribers.map(subscriber => subscriber.email);
      console.log(`Processing ${emails.length} subscriber emails`);
      
      // Send email to all subscribers
      console.log('Calling sendBulkEmails function...');
      const result = await sendBulkEmails(
        emails,
        fromEmail,
        subject,
        content,
        isHtml
      );
      
      console.log('sendBulkEmails result:', result);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        // Additional diagnostic info if it fails
        res.status(500).json({
          ...result,
          diagnosticInfo: {
            senderEmail: fromEmail,
            receiverCount: emails.length,
            contentType: isHtml ? 'HTML' : 'Plain Text',
            apiKeyConfigured: !!process.env.SENDGRID_API_KEY
          }
        });
      }
    } catch (error: any) {
      console.error('Newsletter route error:', error);
      res.status(500).json({ 
        success: false, 
        message: `Failed to send newsletter: ${error.message || 'Unknown error'}`,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
  
  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      // Optional category filter
      const category = req.query.category as string;
      const settings = category 
        ? await storage.getSettingsByCategory(category)
        : await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  
  app.get("/api/settings/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const setting = await storage.getSetting(key);
      
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });
  
  app.patch("/api/settings/:key", requireAdmin, async (req, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      
      if (!value) {
        return res.status(400).json({ message: "Value is required" });
      }
      
      const setting = await storage.updateSetting(key, value);
      
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });
  
  // Authentication routes
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: req.user });
  });
  
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/session", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json({ authenticated: true, user: req.user });
    }
    res.json({ authenticated: false });
  });
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));
  
  // File upload routes
  app.post('/api/upload', requireAdmin, upload.single('image'), handleUploadError, (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Return the URL to the uploaded file
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.status(200).json({ 
      success: true, 
      message: 'File uploaded successfully', 
      fileUrl
    });
  });
  
  // Product image upload route - combining upload with product update
  app.post('/api/admin/products/:id/image', requireAdmin, upload.single('image'), handleUploadError, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      // Get the product
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Create image URL
      const fileUrl = `/uploads/${req.file.filename}`;
      
      // Update product with new image URL
      const updatedProduct = await storage.updateProduct(id, { imageUrl: fileUrl });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Product image updated successfully', 
        product: updatedProduct
      });
    } catch (error) {
      console.error('Product image upload error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update product image' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
