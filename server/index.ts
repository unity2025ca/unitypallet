import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { scheduleOrderCleanupJob } from "./jobs/order-cleanup";
import { startBackupScheduler } from "./jobs/backup-scheduler";
import { securityHeaders, corsHeaders } from "./middleware/security";
import { usernameBruteForceProtection, ipBruteForceProtection } from "./middleware/bruteForce";
import { isReplitEnvironment, getReplitSafeConfig, safeLog } from "./replit-fixes";
import { setupHealthCheck, monitorMemory } from "./health-check";
import { setupReplitFrontendFix, setupReplitErrorHandling, checkDeploymentEnvironment } from "./replit-deployment-fix";
import { setupReplitProductionFix } from "./replit-production-fix";

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
  // Check deployment environment first
  checkDeploymentEnvironment();
  
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    
    // Always show detailed error messages in Replit for debugging
    const isDevelopment = process.env.NODE_ENV === 'development' || isReplitEnvironment();
    const message = isDevelopment 
      ? (err.message || "Internal Server Error") 
      : "Internal Server Error";
    
    // Log the full error in server logs but don't expose in response
    console.error("[ERROR] Request:", req.method, req.url);
    console.error("[ERROR] Full error details:", err);
    console.error("[ERROR] Stack trace:", err.stack);
    
    // For API requests, send JSON
    if (req.path.startsWith('/api/')) {
      const response: { message: string, stack?: string, details?: any } = { message };
      
      // Include stack trace and details in development or Replit
      if (isDevelopment) {
        response.stack = err.stack;
        if (err.details) {
          response.details = err.details;
        }
      }
      
      return res.status(status).json(response);
    }
    
    // For non-API requests, send HTML error page
    res.status(status).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - Jaberco</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 40px; background: #f8fafc; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
          h1 { color: #dc2626; margin-bottom: 20px; }
          p { color: #666; margin-bottom: 20px; }
          .btn { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Server Error</h1>
          <p>We encountered an error: ${message}</p>
          <p>Please try refreshing the page or contact support.</p>
          <a href="/" class="btn">Go to Homepage</a>
        </div>
      </body>
      </html>
    `);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // For Replit, use the production fix immediately
  if (isReplitEnvironment()) {
    console.log('🔧 Using Replit Production Fix');
    setupReplitProductionFix(app);
  } else {
    // Always use development mode for Replit to ensure proper frontend serving
    try {
      console.log('Setting up Vite for Replit environment');
      await setupVite(app, server);
    } catch (error) {
      console.error('Error setting up Vite:', error);
      // Use comprehensive Replit production fix as fallback
      setupReplitProductionFix(app);
    }
  }
  
  // Setup enhanced error handling for Replit
  setupReplitErrorHandling(app);

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000');
  
  // Handle port conflicts gracefully
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Trying alternative port...`);
      const altPort = port + 1;
      server.listen({
        port: altPort,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        const envInfo = isReplitEnvironment() ? ' (Replit Environment)' : '';
        log(`serving on port ${altPort}${envInfo} (alternative port)`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
  
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    const envInfo = isReplitEnvironment() ? ' (Replit Environment)' : '';
    log(`serving on port ${port}${envInfo}`);
    
    // Start memory monitoring in Replit
    if (isReplitEnvironment()) {
      monitorMemory();
    }
    
    // Schedule the order cleanup job to run every 15 minutes
    scheduleOrderCleanupJob(15);
    
    // Start automatic backup scheduler (runs daily at 2:00 AM Toronto time)
    // Only run backup scheduler in production environments with backup URL configured
    const replitConfig = getReplitSafeConfig();
    
    // Only start backup scheduler if not in Replit and backup URL is configured
    if (!replitConfig.disableBackup && process.env.NEW_DATABASE_URL && !isReplitEnvironment()) {
      startBackupScheduler();
    } else {
      const reason = replitConfig.disableBackup 
        ? 'Backup disabled in Replit environment'
        : isReplitEnvironment() 
          ? 'Backup disabled in Replit environment'
          : 'missing NEW_DATABASE_URL';
      safeLog('Backup scheduler disabled -', reason);
    }
  });
})().catch(error => {
  console.error('Fatal error starting server:', error);
  process.exit(1);
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});
