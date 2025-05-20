import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { scheduleOrderCleanupJob } from "./jobs/order-cleanup";
import { securityHeaders, corsHeaders } from "./middleware/security";
import { usernameBruteForceProtection, ipBruteForceProtection } from "./middleware/bruteForce";

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

  // En producción usa el puerto definido en las variables de entorno
  // o el puerto asignado por cPanel, en desarrollo usa el puerto 5000
  const port = process.env.PORT || 5000;
  server.listen({
    port: Number(port),
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Schedule the order cleanup job to run every 15 minutes
    scheduleOrderCleanupJob(15);
  });
})();
