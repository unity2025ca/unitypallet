// Load environment variables first
import { config } from "dotenv";
config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { scheduleOrderCleanupJob } from "./jobs/order-cleanup";
import { startBackupScheduler } from "./jobs/backup-scheduler";
import { securityHeaders, corsHeaders } from "./middleware/security";
import { usernameBruteForceProtection, ipBruteForceProtection } from "./middleware/bruteForce";
// AWS secrets loading - commented out for build compatibility
// const { loadSecretsFromAWS } = require("../aws-secrets.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply security headers to all responses
app.use(securityHeaders);
app.use(corsHeaders);

// Apply brute force protection to auth routes
app.use(usernameBruteForceProtection());
app.use(ipBruteForceProtection());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // AWS Parameter Store integration disabled for build compatibility
  // Environment variables will be used directly

  // Validate critical environment variables
  console.log("🔍 Validating environment configuration...");
  
  if (!process.env.SESSION_SECRET) {
    console.error("❌ SESSION_SECRET not properly configured");
    console.log("Please ensure SESSION_SECRET is set in your environment variables");
    process.exit(1);
  }
  
  console.log("✅ Environment configuration validated");

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    
    // In production, don't expose detailed error messages
    const isDevelopment = process.env.NODE_ENV === 'development';
    const message = isDevelopment 
      ? (err.message || "Internal Server Error") 
      : "Internal Server Error";
    
    // Log the full error in server logs but don't expose in response
    console.error("[ERROR]", err);
    
    // Send appropriate response based on environment
    const response: { message: string, stack?: string, details?: any } = { message };
    
    // Only include stack trace and details in development
    if (isDevelopment) {
      response.stack = err.stack;
      if (err.details) {
        response.details = err.details;
      }
    }

    res.status(status).json(response);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Schedule the order cleanup job to run every 15 minutes
    scheduleOrderCleanupJob(15);
    
    // Start automatic backup scheduler (runs daily at 2:00 AM Toronto time)
    startBackupScheduler();
  });
})();
