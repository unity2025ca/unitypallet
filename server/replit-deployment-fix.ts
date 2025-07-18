// Complete fix for Replit deployment issues
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

// Force deployment to serve the frontend correctly
export function setupReplitFrontendFix(app: any) {
  // Add a catch-all route that serves the frontend
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/health') || req.path.startsWith('/keep-alive') || req.path.startsWith('/ping')) {
      return next();
    }
    
    // Try to serve the built frontend first
    const builtIndexPath = path.resolve(process.cwd(), 'dist/public/index.html');
    if (fs.existsSync(builtIndexPath)) {
      try {
        const html = fs.readFileSync(builtIndexPath, 'utf-8');
        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
      } catch (error) {
        console.error('Error serving built frontend:', error);
      }
    }
    
    // Fallback to development template
    const devIndexPath = path.resolve(process.cwd(), 'client/index.html');
    if (fs.existsSync(devIndexPath)) {
      try {
        const html = fs.readFileSync(devIndexPath, 'utf-8');
        // Transform for development serving
        const transformedHtml = html.replace(
          'src="/src/main.tsx"',
          'src="/src/main.tsx"'
        );
        res.setHeader('Content-Type', 'text/html');
        return res.send(transformedHtml);
      } catch (error) {
        console.error('Error serving development frontend:', error);
      }
    }
    
    // Ultimate fallback - basic HTML
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Jaberco E-commerce</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .logo { text-align: center; margin-bottom: 30px; }
          .logo img { max-width: 200px; height: auto; }
          .message { text-align: center; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="https://res.cloudinary.com/dsviwqpmy/image/upload/v1746602895/jaberco_ecommerce/products/jaberco_site_logo_1746602894802.jpg" alt="Jaberco Logo">
          </div>
          <div class="message">
            <h1>Jaberco E-commerce Platform</h1>
            <p>Welcome to Canada's premier Amazon return pallet marketplace</p>
            <p>The application is starting up. Please refresh the page in a few moments.</p>
            <a href="/" class="button">Refresh Page</a>
          </div>
        </div>
        <script>
          // Auto-refresh after 5 seconds
          setTimeout(() => {
            window.location.reload();
          }, 5000);
        </script>
      </body>
      </html>
    `);
  });
}

// Enhanced error handling for Replit
export function setupReplitErrorHandling(app: any) {
  // Global error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('=== REPLIT ERROR ===');
    console.error('Request:', req.method, req.url);
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('===================');
    
    // Always return JSON for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        timestamp: new Date().toISOString()
      });
    }
    
    // For non-API routes, serve an error page
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Server Error - Jaberco</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .error-container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error-title { color: #dc2626; margin-bottom: 20px; }
          .error-message { color: #666; margin-bottom: 20px; }
          .retry-button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1 class="error-title">Server Error</h1>
          <div class="error-message">
            <p>Sorry, we're experiencing technical difficulties.</p>
            <p>Error: ${err.message}</p>
            <p>Please try again in a few moments.</p>
          </div>
          <a href="/" class="retry-button">Try Again</a>
        </div>
      </body>
      </html>
    `);
  });
}

// Check deployment environment
export function checkDeploymentEnvironment() {
  console.log('=== DEPLOYMENT ENVIRONMENT CHECK ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('REPLIT_DEPLOYMENT:', process.env.REPLIT_DEPLOYMENT);
  console.log('REPLIT_DOMAIN:', process.env.REPLIT_DOMAIN);
  console.log('REPLIT_DOMAINS:', process.env.REPLIT_DOMAINS);
  console.log('REPLIT_ENVIRONMENT:', process.env.REPLIT_ENVIRONMENT);
  console.log('REPLIT_DB_URL:', process.env.REPLIT_DB_URL ? 'Set' : 'Not set');
  console.log('REPLIT_SLUG:', process.env.REPLIT_SLUG);
  console.log('PORT:', process.env.PORT);
  console.log('Current working directory:', process.cwd());
  console.log('Built frontend exists:', fs.existsSync(path.resolve(process.cwd(), 'dist/public/index.html')));
  console.log('Dev frontend exists:', fs.existsSync(path.resolve(process.cwd(), 'client/index.html')));
  console.log('====================================');
  
  // Force development mode for Replit deployments
  if (process.env.REPLIT_ENVIRONMENT === 'production' || process.env.REPLIT_DOMAINS) {
    console.log('🔧 FORCING DEVELOPMENT MODE FOR REPLIT DEPLOYMENT');
    process.env.NODE_ENV = 'development';
  }
}