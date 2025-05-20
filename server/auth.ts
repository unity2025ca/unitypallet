import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Hash password
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare passwords
async function comparePasswords(supplied: string, stored: string) {
  try {
    console.log('Comparing passwords, stored format:', stored ? stored.substring(0, 10) + '...' : 'null');
    
    // Check if stored password is in valid format
    if (!stored || !stored.includes('.')) {
      console.error('Invalid stored password format, missing salt separator');
      return false;
    }
    
    const [hashed, salt] = stored.split(".");
    
    // Check if hash and salt are present
    if (!hashed || !salt) {
      console.error('Invalid stored password, missing hash or salt');
      return false;
    }
    
    console.log('Password verification debug:', { 
      hashedLength: hashed.length,
      saltLength: salt.length,
      algorithm: 'scrypt',
      keyLength: 64
    });
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    // Check if lengths match before comparison
    if (hashedBuf.length !== suppliedBuf.length) {
      console.error('Hash length mismatch', { 
        hashedLength: hashedBuf.length, 
        suppliedLength: suppliedBuf.length 
      });
      return false;
    }
    
    const result = timingSafeEqual(hashedBuf, suppliedBuf);
    console.log('Password verification result:', result);
    return result;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  // Generate a cryptographically secure random session secret if not provided
  const generateSecureSecret = () => {
    const bytes = randomBytes(32); // 256 bits of entropy
    return 'jaberco-secure-key-' + bytes.toString('hex');
  };
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || generateSecureSecret(),
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      httpOnly: true // Prevents client-side JS from reading the cookie
    }
    // Temporarily removed session store to avoid database quota issues
  };

  // Trust proxy to allow secure cookies behind a reverse proxy
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }
  
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username" });
        }
        
        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware for role-based permissions
  
  // Check if user is admin (full access)
  const requireAdmin = (req: any, res: any, next: any) => {
    const user = req.user;
    if (!req.isAuthenticated() || !(user?.isAdmin || user?.roleType === 'admin')) {
      return res.status(401).json({ message: "Unauthorized - Admin access required" });
    }
    next();
  };
  
  // Check if user is a publisher (can manage products and view contacts)
  const requirePublisher = (req: any, res: any, next: any) => {
    const user = req.user;
    if (!req.isAuthenticated() || 
        !(user?.isAdmin || user?.roleType === 'admin' || user?.roleType === 'publisher')) {
      return res.status(401).json({ message: "Unauthorized - Publisher access required" });
    }
    next();
  };
  
  // Check if user can manage products (admin or publisher)
  const canManageProducts = (req: any, res: any, next: any) => {
    const user = req.user;
    if (!req.isAuthenticated() || 
        !(user?.isAdmin || user?.roleType === 'admin' || user?.roleType === 'publisher')) {
      return res.status(401).json({ message: "Unauthorized - Cannot manage products" });
    }
    next();
  };
  
  // Check if user can view contacts (admin or publisher)
  const canViewContacts = (req: any, res: any, next: any) => {
    const user = req.user;
    if (!req.isAuthenticated() || 
        !(user?.isAdmin || user?.roleType === 'admin' || user?.roleType === 'publisher')) {
      return res.status(401).json({ message: "Unauthorized - Cannot view contacts" });
    }
    next();
  };
  
  // Check if user can manage appointments (admin or publisher)
  const canManageAppointments = (req: any, res: any, next: any) => {
    const user = req.user;
    if (!req.isAuthenticated() || 
        !(user?.isAdmin || user?.roleType === 'admin' || user?.roleType === 'publisher')) {
      return res.status(401).json({ message: "Unauthorized - Cannot manage appointments" });
    }
    next();
  };
  
  // API routes for authentication
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, roleType = 'user' } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "Username already exists" 
        });
      }
      
      // Create the user with hashed password
      const hashedPassword = await hashPassword(password);
      const isAdmin = roleType === 'admin'; // For backwards compatibility
      
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        isAdmin,
        roleType
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin,
            roleType: user.roleType
          }
        });
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ 
        success: false, 
        message: `Registration failed: ${error.message || 'Unknown error'}`
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
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
        
        // Return user info without sensitive data
        res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin,
            roleType: user.roleType
          }
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Error during logout" 
        });
      }
      
      res.json({ 
        success: true, 
        message: "Successfully logged out" 
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    const user = req.user as SelectUser;
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        roleType: user.roleType
      }
    });
  });

  // Session check endpoint
  app.get("/api/session", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as SelectUser;
      console.log("Session check - authenticated:", user.username);
      return res.json({
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
          roleType: user.roleType
        }
      });
    } else {
      console.log("Session check - not authenticated");
      return res.json({
        authenticated: false
      });
    }
  });

  return { requireAdmin, requirePublisher, canManageProducts, canViewContacts, canManageAppointments };
}

// Export the password hashing function for use in other modules
export { hashPassword };