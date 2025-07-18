// Ultimate fix for Replit production deployment
import express from 'express';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Create a robust frontend serving solution for Replit
export function setupReplitProductionFix(app: express.Application) {
  console.log('🔧 Setting up Replit Production Fix');
  
  // Serve static assets first
  const publicPath = path.join(process.cwd(), 'client/public');
  if (fs.existsSync(publicPath)) {
    app.use('/assets', express.static(publicPath));
    console.log('✅ Static assets served from:', publicPath);
  }
  
  // Handle all non-API routes with HTML
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    console.log('Replit Production Fix - Serving request:', req.path);
    
    // Skip API routes and static files
    if (req.path.startsWith('/api/') || 
        req.path.startsWith('/health') || 
        req.path.startsWith('/keep-alive') || 
        req.path.startsWith('/ping') ||
        req.path.startsWith('/assets/') ||
        req.path.endsWith('.js') ||
        req.path.endsWith('.css') ||
        req.path.endsWith('.ico') ||
        req.path.endsWith('.png') ||
        req.path.endsWith('.jpg') ||
        req.path.endsWith('.svg')) {
      console.log('Skipping frontend fix for:', req.path);
      return next();
    }
    
    // Serve the main HTML file for all other requests
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jaberco - Amazon Return Pallets Canada</title>
    <meta name="description" content="Canada's premier marketplace for Amazon return pallets and liquidation inventory. Discover quality products at unbeatable prices.">
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px 0; margin-bottom: 30px; }
        .logo { text-align: center; }
        .logo img { max-width: 200px; height: auto; }
        .hero { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 60px 20px; text-align: center; border-radius: 10px; margin-bottom: 40px; }
        .hero h1 { font-size: 2.5rem; margin-bottom: 20px; }
        .hero p { font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-bottom: 40px; }
        .feature { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
        .feature h3 { color: #dc2626; margin-bottom: 15px; }
        .cta { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
        .btn { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px; }
        .btn:hover { background: #b91c1c; }
        .loading { text-align: center; padding: 40px; color: #666; }
        .spinner { display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #dc2626; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 10px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .products { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
        .product { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .product img { width: 100%; height: 200px; object-fit: cover; }
        .product-info { padding: 20px; }
        .product-title { font-weight: bold; margin-bottom: 10px; }
        .product-price { color: #dc2626; font-size: 1.2rem; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <div class="logo">
                <img src="https://res.cloudinary.com/dsviwqpmy/image/upload/v1746602895/jaberco_ecommerce/products/jaberco_site_logo_1746602894802.jpg" alt="Jaberco Logo">
            </div>
        </div>
    </div>
    
    <div class="container">
        <div class="hero">
            <h1>Welcome to Jaberco</h1>
            <p>Canada's Premier Amazon Return Pallet Marketplace</p>
            <div class="loading">
                <div class="spinner"></div>
                Loading application...
            </div>
        </div>
        
        <div class="features">
            <div class="feature">
                <h3>🎯 Quality Products</h3>
                <p>Carefully curated Amazon return pallets with detailed condition reports</p>
            </div>
            <div class="feature">
                <h3>💰 Unbeatable Prices</h3>
                <p>Save up to 70% on retail prices with our liquidation inventory</p>
            </div>
            <div class="feature">
                <h3>🚚 Fast Shipping</h3>
                <p>Quick delivery across Canada with tracking information</p>
            </div>
        </div>
        
        <div class="cta">
            <h2>Application Starting...</h2>
            <p>Please wait while we load the full shopping experience.</p>
            <a href="javascript:window.location.reload()" class="btn">Refresh Page</a>
        </div>
    </div>
    
    <script>
        let retryCount = 0;
        const maxRetries = 5;
        
        function checkAppStatus() {
            fetch('/api/products')
                .then(response => {
                    if (response.ok) {
                        // App is ready, reload the page
                        window.location.reload();
                    } else {
                        throw new Error('App not ready');
                    }
                })
                .catch(error => {
                    retryCount++;
                    if (retryCount < maxRetries) {
                        console.log('Retrying... (' + retryCount + '/' + maxRetries + ')');
                        setTimeout(checkAppStatus, 2000);
                    } else {
                        document.querySelector('.loading').innerHTML = 
                            '<p>Application is starting up. Please refresh the page in a moment.</p>';
                    }
                });
        }
        
        // Start checking after 3 seconds
        setTimeout(checkAppStatus, 3000);
        
        // Auto-refresh every 10 seconds as fallback
        setInterval(() => {
            window.location.reload();
        }, 10000);
    </script>
</body>
</html>`;
    
    console.log('Serving HTML content for:', req.path);
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(htmlContent);
  });
}

// Enhanced error handling
export function setupReplitErrorHandling(app: express.Application) {
  // Global error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('=== REPLIT ERROR HANDLER ===');
    console.error('Request:', req.method, req.url);
    console.error('Headers:', JSON.stringify(req.headers, null, 2));
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('============================');
    
    // For API routes, return JSON error
    if (req.path.startsWith('/api/')) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        timestamp: new Date().toISOString()
      });
    }
    
    // For other routes, return HTML error page
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Server Error - Jaberco</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 40px; background: #f8fafc; }
          .error-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .error-title { color: #dc2626; margin-bottom: 20px; font-size: 2rem; }
          .error-message { color: #666; margin-bottom: 30px; line-height: 1.6; }
          .retry-button { display: inline-block; padding: 15px 30px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .retry-button:hover { background: #b91c1c; }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1 class="error-title">🚨 Server Error</h1>
          <div class="error-message">
            <p>We encountered an error while processing your request.</p>
            <p><strong>Error:</strong> ${err.message}</p>
            <p>Please try refreshing the page or contact support if the problem persists.</p>
          </div>
          <a href="/" class="retry-button">Return to Home</a>
          <a href="javascript:window.location.reload()" class="retry-button">Refresh Page</a>
        </div>
      </body>
      </html>
    `);
  });
}