// Health check endpoint specifically for Replit deployments
import { Request, Response } from 'express';

export function setupHealthCheck(app: any) {
  // Basic health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: process.env.DATABASE_URL ? 'connected' : 'not configured',
      memory: process.memoryUsage(),
      uptime: process.uptime()
    });
  });

  // Keep-alive endpoint for Replit
  app.get('/keep-alive', (req: Request, res: Response) => {
    res.status(200).json({ alive: true });
  });

  // Simple ping endpoint
  app.get('/ping', (req: Request, res: Response) => {
    res.status(200).send('pong');
  });
}

// Memory monitoring for Replit
export function monitorMemory() {
  setInterval(() => {
    const memory = process.memoryUsage();
    const used = Math.round(memory.heapUsed / 1024 / 1024);
    const total = Math.round(memory.heapTotal / 1024 / 1024);
    
    if (used > 450) { // Alert if using more than 450MB
      console.warn(`High memory usage: ${used}MB/${total}MB`);
    }
    
    // Force garbage collection if available
    if (global.gc && used > 400) {
      global.gc();
    }
  }, 30000); // Check every 30 seconds
}