import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertContactSchema, 
  insertSubscriberSchema, 
  insertUserSchema,
  insertFaqSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import { z } from "zod";
import { sendBulkEmails } from "./email";
import { sendSMS, sendBulkSMS } from "./sms";
import { upload, handleUploadError } from "./upload";
import path from "path";
import fs from "fs";
import { uploadImage, deleteImage, extractPublicIdFromUrl } from "./cloudinary";

// Setup authentication
const setupAuth = (app: Express) => {
  // Trust proxy for secure cookies with HTTPS when behind a reverse proxy
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'unity-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    },
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
  
  // Auth middleware for role-based permissions
  
  // Check if user is admin (full access)
  const requireAdmin = (req: Request, res: Response, next: any) => {
    const user = req.user as any;
    if (!req.isAuthenticated() || !(user?.isAdmin || user?.roleType === 'admin')) {
      return res.status(401).json({ message: "Unauthorized - Admin access required" });
    }
    next();
  };
  
  // Check if user is a publisher (can manage products and view contacts)
  const requirePublisher = (req: Request, res: Response, next: any) => {
    const user = req.user as any;
    if (!req.isAuthenticated() || 
        !(user?.isAdmin || user?.roleType === 'admin' || user?.roleType === 'publisher')) {
      return res.status(401).json({ message: "Unauthorized - Publisher access required" });
    }
    next();
  };
  
  // Check if user can manage products (admin or publisher)
  const canManageProducts = (req: Request, res: Response, next: any) => {
    const user = req.user as any;
    if (!req.isAuthenticated() || 
        !(user?.isAdmin || user?.roleType === 'admin' || user?.roleType === 'publisher')) {
      return res.status(401).json({ message: "Unauthorized - Cannot manage products" });
    }
    next();
  };
  
  // Check if user can view contacts (admin or publisher)
  const canViewContacts = (req: Request, res: Response, next: any) => {
    const user = req.user as any;
    if (!req.isAuthenticated() || 
        !(user?.isAdmin || user?.roleType === 'admin' || user?.roleType === 'publisher')) {
      return res.status(401).json({ message: "Unauthorized - Cannot view contacts" });
    }
    next();
  };
  
  return { requireAdmin, requirePublisher, canManageProducts, canViewContacts };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication and get permission checkers
  const { requireAdmin, requirePublisher, canManageProducts, canViewContacts } = setupAuth(app);
  
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
  
  // Product management routes (protected for admin and publisher)
  // Publishers can create products
  app.post("/api/admin/products", canManageProducts, async (req, res) => {
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
  
  // Publishers can update products
  app.put("/api/admin/products/:id", canManageProducts, async (req, res) => {
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
  
  // Only admin can delete products (publishers can't delete)
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
  
  // Publishers can view contacts but not modify them
  app.get("/api/admin/contacts", canViewContacts, async (_req, res) => {
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
  
  // Import contact phone numbers as subscribers
  app.post("/api/admin/subscribers/import-contacts", requireAdmin, async (_req, res) => {
    try {
      // Get all contacts
      const contacts = await storage.getAllContacts();
      
      if (contacts.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "No contacts found to import" 
        });
      }
      
      // Get current subscribers
      const existingSubscribers = await storage.getAllSubscribers();
      const existingEmails = new Set(existingSubscribers.map(sub => sub.email));
      const existingPhones = new Set(existingSubscribers.filter(sub => sub.phone).map(sub => sub.phone));
      
      let imported = 0;
      let skipped = 0;
      
      // Process each contact
      for (const contact of contacts) {
        // Skip if no phone number or already exists
        if (!contact.phone || existingPhones.has(contact.phone)) {
          skipped++;
          continue;
        }
        
        // Create subscriber with contact information
        // If the email already exists, update the phone number
        const existingWithEmail = existingEmails.has(contact.email);
        
        if (existingWithEmail) {
          // Find the subscriber with matching email
          const subToUpdate = existingSubscribers.find(sub => sub.email === contact.email);
          if (subToUpdate && !subToUpdate.phone) {
            // Update phone if not already set
            await storage.updateSubscriber(subToUpdate.id, { phone: contact.phone });
            imported++;
          } else {
            skipped++;
          }
        } else {
          // Create new subscriber
          await storage.createSubscriber({
            email: contact.email,
            phone: contact.phone
          });
          imported++;
          existingEmails.add(contact.email);
          existingPhones.add(contact.phone);
        }
      }
      
      res.status(200).json({
        success: true,
        message: `Successfully imported ${imported} contacts to subscribers. ${skipped} contacts were skipped (already exist or missing phone).`,
        imported,
        skipped
      });
    } catch (error: any) {
      console.error('Contact import error:', error);
      res.status(500).json({ 
        success: false, 
        message: `Failed to import contacts: ${error.message || 'Unknown error'}`
      });
    }
  });
  
  // Import phone numbers from contact messages
  app.post("/api/admin/subscribers/import-from-messages", requireAdmin, async (_req, res) => {
    try {
      // Get all contacts
      const contacts = await storage.getAllContacts();
      
      if (contacts.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "No contacts found to import" 
        });
      }
      
      // Get current subscribers
      const existingSubscribers = await storage.getAllSubscribers();
      const existingPhones = new Set(existingSubscribers.filter(sub => sub.phone).map(sub => sub.phone));
      
      // Regular expression to match phone numbers in messages
      // This pattern looks for international format numbers: +1234567890 or +123 456 7890
      const phoneRegex = /\+[0-9\s]{10,15}/g;
      
      let imported = 0;
      let skipped = 0;
      
      // Process each contact's message
      for (const contact of contacts) {
        if (!contact.message || !contact.message.trim()) {
          continue;
        }
        
        // Extract phone numbers from message content
        const message = contact.message.trim();
        const matches = message.match(phoneRegex);
        
        if (!matches || matches.length === 0) {
          continue;
        }
        
        // Process each found phone number
        for (const match of matches) {
          // Normalize phone number (remove spaces)
          const phoneNumber = match.replace(/\s/g, '').trim();
          
          // Skip if phone number already exists as a subscriber
          if (existingPhones.has(phoneNumber)) {
            skipped++;
            continue;
          }
          
          // Create new subscriber with the phone number
          await storage.createSubscriber({
            email: contact.email || '',
            phone: phoneNumber,
            subscribed: true
          });
          
          imported++;
          existingPhones.add(phoneNumber);
        }
      }
      
      res.status(200).json({
        success: true,
        message: `Successfully imported ${imported} phone numbers from messages. ${skipped} numbers were skipped (already exist).`,
        imported,
        skipped
      });
    } catch (error: any) {
      console.error('Message phone import error:', error);
      res.status(500).json({ 
        success: false, 
        message: `Failed to import phone numbers from messages: ${error.message || 'Unknown error'}`
      });
    }
  });

  // SMS Messaging routes
  
  // Send SMS to a single number (admin only)
  app.post("/api/admin/sms/send", requireAdmin, async (req, res) => {
    try {
      const { to, body } = req.body;
      
      // Validate required fields
      if (!to || !body) {
        const missingFields = [];
        if (!to) missingFields.push('to');
        if (!body) missingFields.push('body');
        
        return res.status(400).json({ 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }
      
      // Validate phone number format (starts with + and has at least 10 digits)
      const phoneRegex = /^\+[0-9]{10,15}$/;
      if (!phoneRegex.test(to)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format. Must be in international format starting with + (e.g., +1234567890)"
        });
      }
      
      // Send SMS
      const result = await sendSMS(to, body);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error: any) {
      console.error('SMS send error:', error);
      res.status(500).json({ 
        success: false, 
        message: `Failed to send SMS: ${error.message || 'Unknown error'}`
      });
    }
  });
  
  // Send bulk SMS to multiple numbers (admin only)
  app.post("/api/admin/sms/bulk", requireAdmin, async (req, res) => {
    try {
      const { to, body } = req.body;
      
      // Validate required fields
      if (!to || !Array.isArray(to) || to.length === 0 || !body) {
        const errors = [];
        if (!to) errors.push('Missing "to" field');
        else if (!Array.isArray(to)) errors.push('"to" must be an array');
        else if (to.length === 0) errors.push('"to" array cannot be empty');
        if (!body) errors.push('Missing "body" field');
        
        return res.status(400).json({ 
          success: false, 
          message: `Validation error: ${errors.join(', ')}` 
        });
      }
      
      // Validate all phone numbers
      const phoneRegex = /^\+[0-9]{10,15}$/;
      const invalidNumbers = to.filter(number => !phoneRegex.test(number));
      
      if (invalidNumbers.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format detected. All numbers must be in international format starting with + (e.g., +1234567890)",
          invalidNumbers
        });
      }
      
      // Send bulk SMS
      const results = await sendBulkSMS(to, body);
      
      // Check if all messages were sent successfully
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        res.status(200).json({
          success: true,
          message: `Successfully sent ${results.length} messages`,
          results
        });
      } else {
        // Some messages failed
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;
        
        res.status(207).json({
          success: false,
          message: `Partially successful: ${successCount} sent, ${failureCount} failed`,
          results
        });
      }
    } catch (error: any) {
      console.error('Bulk SMS send error:', error);
      res.status(500).json({ 
        success: false, 
        message: `Failed to send bulk SMS: ${error.message || 'Unknown error'}`
      });
    }
  });
  
  // Send SMS to all subscribers (admin only)
  app.post("/api/admin/sms/subscribers", requireAdmin, async (req, res) => {
    try {
      const { body } = req.body;
      
      // Validate required field
      if (!body) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required field: body" 
        });
      }
      
      // Get all subscribers
      const subscribers = await storage.getAllSubscribers();
      
      if (subscribers.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "No subscribers found to send SMS to" 
        });
      }
      
      // Filter subscribers with valid phone numbers
      const subscribersWithPhone = subscribers.filter(sub => sub.phone && sub.phone.startsWith('+'));
      
      if (subscribersWithPhone.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "No subscribers with valid phone numbers found" 
        });
      }
      
      // Extract phone numbers
      const phoneNumbers = subscribersWithPhone.map(sub => sub.phone as string);
      
      // Send bulk SMS
      const results = await sendBulkSMS(phoneNumbers, body);
      
      // Check if all messages were sent successfully
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        res.status(200).json({
          success: true,
          message: `Successfully sent ${results.length} messages to subscribers`,
          results
        });
      } else {
        // Some messages failed
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;
        
        res.status(207).json({
          success: false,
          message: `Partially successful: ${successCount} sent, ${failureCount} failed`,
          results
        });
      }
    } catch (error: any) {
      console.error('Subscriber SMS send error:', error);
      res.status(500).json({ 
        success: false, 
        message: `Failed to send SMS to subscribers: ${error.message || 'Unknown error'}`
      });
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
  
  // Authentication routes with improved error handling
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Internal server error during login" 
        });
      }
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: info?.message || "Invalid username or password" 
        });
      }
      
      // Log in the user
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Session creation error:", loginErr);
          return res.status(500).json({ 
            success: false, 
            message: "Failed to create session" 
          });
        }
        
        // Successfully logged in
        console.log("User logged in successfully:", user.username);
        return res.status(200).json({ 
          success: true, 
          message: "Login successful", 
          user 
        });
      });
    })(req, res, next);
  });
  
  app.post("/api/logout", (req, res) => {
    // Store username for logging
    const username = (req.user as any)?.username;
    
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to logout" 
        });
      }
      
      console.log("User logged out successfully:", username);
      res.status(200).json({ 
        success: true, 
        message: "Logged out successfully" 
      });
    });
  });
  
  app.get("/api/session", (req, res) => {
    try {
      if (req.isAuthenticated()) {
        const user = req.user as any;
        console.log("Session check - authenticated:", user?.username);
        return res.json({ 
          authenticated: true, 
          user,
          sessionID: req.sessionID
        });
      }
      
      console.log("Session check - not authenticated");
      res.json({ 
        authenticated: false,
        sessionID: req.sessionID 
      });
    } catch (error) {
      console.error("Session check error:", error);
      res.status(500).json({ 
        authenticated: false, 
        error: "Failed to check authentication status" 
      });
    }
  });
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));
  
  // File upload routes - only admin can upload general files
  app.post('/api/upload', requireAdmin, upload.single('image'), handleUploadError, async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    try {
      // رفع الصورة إلى Cloudinary
      const uploadResult = await uploadImage(req.file.path);
      
      // حذف الملف المؤقت بعد الرفع
      fs.unlinkSync(req.file.path);
      
      if (!uploadResult.success) {
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload image to cloud storage',
          error: uploadResult.error
        });
      }
      
      // إرجاع عنوان URL للصورة المرفوعة
      return res.status(200).json({ 
        success: true, 
        message: 'File uploaded successfully', 
        fileUrl: uploadResult.imageUrl,
        publicId: uploadResult.publicId
      });
    } catch (error: any) {
      console.error('Error uploading file to cloud storage:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error uploading file',
        error: error.message
      });
    }
  });
  
  // Product image upload route - publishers can upload product images
  app.post('/api/admin/products/:id/image', canManageProducts, upload.single('image'), handleUploadError, async (req: Request, res: Response) => {
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
      
      try {
        // رفع الصورة إلى Cloudinary بمعرّف فريد للصورة
        const productPublicId = `product_${id}_${Date.now()}`;
        const uploadResult = await uploadImage(req.file.path, productPublicId);
        
        // حذف الملف المؤقت بعد الرفع
        fs.unlinkSync(req.file.path);
        
        if (!uploadResult.success) {
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to upload image to cloud storage',
            error: uploadResult.error
          });
        }
        
        // استخدام عنوان URL من Cloudinary
        const fileUrl = uploadResult.imageUrl;
        console.log('File URL from Cloudinary:', fileUrl);
        
        // Set whether this should be the main image
        const isMain = req.body.isMain === 'true';
        
        // Get the display order
        let displayOrder = 0;
        if (req.body.displayOrder) {
          displayOrder = parseInt(req.body.displayOrder);
          if (isNaN(displayOrder)) displayOrder = 0;
        }
        
        // إضافة معلومات إضافية للصورة (معرف Cloudinary)
        const cloudinaryData = {
          publicId: uploadResult.publicId,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format
        };
        
        // Add the image to product_images table
        const productImage = await storage.addProductImage({
          productId: id,
          imageUrl: fileUrl || '', // نتأكد من أن fileUrl ليس undefined
          isMain: isMain || false,
          displayOrder: displayOrder || 0
        });
        
        // If this is set as the main image, update the main product image reference
        if (isMain) {
          await storage.setMainProductImage(id, productImage.id);
        }
        
        // For backward compatibility, always update the product's imageUrl when a new image is added
        // If this is the main image or this is the first image for the product
        const existingImages = await storage.getProductImages(id);
        if (isMain || existingImages.length === 1) {
          await storage.updateProduct(id, { imageUrl: fileUrl });
        }
        
        return res.status(200).json({ 
          success: true, 
          message: 'Product image added successfully',
          image: productImage
        });
        
      } catch (uploadError: any) {
        console.error('Error uploading product image to cloud storage:', uploadError);
        return res.status(500).json({ 
          success: false, 
          message: 'Error uploading product image to cloud storage',
          error: uploadError.message
        });
      }
    } catch (error: any) {
      console.error('Product image upload error:', error);
      return res.status(500).json({ success: false, message: 'Failed to add product image', error: error.message });
    }
  });
  
  // Get all product images
  app.get('/api/products/:id/images', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const images = await storage.getProductImages(id);
      return res.status(200).json(images);
    } catch (error) {
      console.error('Error getting product images:', error);
      return res.status(500).json({ message: "Error retrieving product images" });
    }
  });
  
  // Set main product image - publishers can change main image
  app.patch('/api/admin/products/:productId/images/:imageId/main', canManageProducts, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.productId);
      const imageId = parseInt(req.params.imageId);
      
      if (isNaN(productId) || isNaN(imageId)) {
        return res.status(400).json({ message: "Invalid product or image ID" });
      }
      
      const success = await storage.setMainProductImage(productId, imageId);
      
      if (success) {
        return res.status(200).json({ success: true, message: 'Main product image updated' });
      } else {
        return res.status(404).json({ success: false, message: 'Product image not found' });
      }
    } catch (error) {
      console.error('Error setting main product image:', error);
      return res.status(500).json({ message: "Error updating main product image" });
    }
  });
  
  // Delete product image - publishers can delete images
  app.delete('/api/admin/products/images/:imageId', canManageProducts, async (req: Request, res: Response) => {
    try {
      const imageId = parseInt(req.params.imageId);
      
      if (isNaN(imageId)) {
        return res.status(400).json({ message: "Invalid image ID" });
      }
      
      // نحصل على تفاصيل الصورة أولاً للحصول على عنوان URL لاستخراج معرّف Cloudinary
      const imageDetails = await storage.getProductImageById(imageId);
      
      if (!imageDetails) {
        return res.status(404).json({ success: false, message: 'Product image not found' });
      }
      
      // نحذف الصورة من قاعدة البيانات
      const success = await storage.deleteProductImage(imageId);
      
      if (success) {
        // نحاول حذف الصورة من Cloudinary إذا كانت الصورة تستخدم Cloudinary
        if (imageDetails.imageUrl && imageDetails.imageUrl.includes('cloudinary.com')) {
          try {
            // استخراج معرّف Cloudinary من عنوان URL
            const publicId = extractPublicIdFromUrl(imageDetails.imageUrl);
            
            if (publicId) {
              // حذف الصورة من Cloudinary
              await deleteImage(publicId);
              console.log(`Deleted image from Cloudinary: ${publicId}`);
            }
          } catch (cloudinaryError) {
            // نسجل الخطأ فقط ولا نمنع نجاح العملية إذا فشل الحذف من Cloudinary
            console.error('Error deleting image from Cloudinary:', cloudinaryError);
          }
        }
        
        return res.status(200).json({ success: true, message: 'Product image deleted' });
      } else {
        return res.status(404).json({ success: false, message: 'Failed to delete product image' });
      }
    } catch (error: any) {
      console.error('Error deleting product image:', error);
      return res.status(500).json({ 
        message: "Error deleting product image", 
        error: error.message
      });
    }
  });

  // FAQ Routes - Public routes for getting FAQs
  app.get('/api/faqs', async (req: Request, res: Response) => {
    try {
      const faqs = await storage.getAllFaqs();
      res.json(faqs);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });

  // Admin routes for managing FAQs
  app.get('/api/admin/faqs', requireAdmin, async (req: Request, res: Response) => {
    try {
      const faqs = await storage.getAllFaqs();
      res.json(faqs);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });

  app.get('/api/admin/faqs/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid FAQ ID" });
      }
      
      const faq = await storage.getFaqById(id);
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      
      res.json(faq);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      res.status(500).json({ message: "Failed to fetch FAQ" });
    }
  });

  app.post('/api/admin/faqs', requireAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertFaqSchema.parse(req.body);
      const faq = await storage.createFaq(validatedData);
      res.status(201).json(faq);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid FAQ data", errors: error.errors });
      }
      console.error('Error creating FAQ:', error);
      res.status(500).json({ message: "Failed to create FAQ" });
    }
  });

  app.put('/api/admin/faqs/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid FAQ ID" });
      }
      
      // Partial validation of the request body
      const validatedData = insertFaqSchema.partial().parse(req.body);
      
      const updatedFaq = await storage.updateFaq(id, validatedData);
      if (!updatedFaq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      
      res.json(updatedFaq);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid FAQ data", errors: error.errors });
      }
      console.error('Error updating FAQ:', error);
      res.status(500).json({ message: "Failed to update FAQ" });
    }
  });

  app.delete('/api/admin/faqs/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid FAQ ID" });
      }
      
      const success = await storage.deleteFaq(id);
      if (!success) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      res.status(500).json({ message: "Failed to delete FAQ" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
