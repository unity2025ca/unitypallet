// Simple server for Replit deployment
import express from 'express';
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

// Create a simple server that works reliably on Replit
export function createReplitServer() {
  const app = express();
  
  // Basic middleware
  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), 'client/public')));
  
  // Health check endpoints
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  app.get('/ping', (req: Request, res: Response) => {
    res.json({ pong: true });
  });
  
  // Basic API endpoints
  app.get('/api/products', (req: Request, res: Response) => {
    res.json([
      {
        id: 1,
        title: "Amazon Return Pallet - Electronics",
        price: 299.99,
        description: "Mixed electronics return pallet with various items",
        images: ["https://res.cloudinary.com/dsviwqpmy/image/upload/v1734556848/jaberco_ecommerce/products/electronics_pallet_1734556847.jpg"]
      },
      {
        id: 2,
        title: "Home & Kitchen Return Pallet",
        price: 199.99,
        description: "Assorted home and kitchen items return pallet",
        images: ["https://res.cloudinary.com/dsviwqpmy/image/upload/v1734556848/jaberco_ecommerce/products/home_kitchen_pallet_1734556847.jpg"]
      }
    ]);
  });
  
  app.get('/api/settings', (req: Request, res: Response) => {
    res.json([
      {
        key: "site_logo",
        value: "https://res.cloudinary.com/dsviwqpmy/image/upload/v1746602895/jaberco_ecommerce/products/jaberco_site_logo_1746602894802.jpg"
      },
      {
        key: "site_name",
        value: "Jaberco"
      }
    ]);
  });
  
  // Serve main HTML for all other routes
  app.get('*', (req: Request, res: Response) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jaberco - Amazon Return Pallets Canada</title>
    <meta name="description" content="Canada's premier marketplace for Amazon return pallets and liquidation inventory.">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        
        .header { background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .header-content { display: flex; justify-content: space-between; align-items: center; padding: 20px; }
        .logo img { max-width: 150px; height: auto; }
        .nav { display: flex; gap: 30px; }
        .nav a { text-decoration: none; color: #333; font-weight: 500; }
        .nav a:hover { color: #dc2626; }
        
        .hero { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 80px 40px; text-align: center; border-radius: 15px; margin-bottom: 50px; }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; font-weight: 700; }
        .hero p { font-size: 1.3rem; margin-bottom: 30px; opacity: 0.9; }
        .hero .cta { display: inline-flex; gap: 15px; margin-top: 20px; }
        .btn { padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: all 0.3s; }
        .btn-primary { background: white; color: #dc2626; }
        .btn-primary:hover { background: #f8f9fa; transform: translateY(-2px); }
        .btn-secondary { background: rgba(255,255,255,0.1); color: white; border: 2px solid white; }
        .btn-secondary:hover { background: white; color: #dc2626; }
        
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-bottom: 50px; }
        .feature { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
        .feature-icon { font-size: 3rem; margin-bottom: 20px; }
        .feature h3 { color: #dc2626; margin-bottom: 15px; font-size: 1.4rem; }
        .feature p { color: #666; font-size: 1.1rem; }
        
        .products-section { background: white; padding: 50px 40px; border-radius: 15px; margin-bottom: 50px; }
        .products-section h2 { text-align: center; margin-bottom: 40px; font-size: 2.5rem; color: #333; }
        .products { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; }
        .product { border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; transition: transform 0.3s; }
        .product:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
        .product img { width: 100%; height: 200px; object-fit: cover; }
        .product-info { padding: 20px; }
        .product-title { font-weight: 600; margin-bottom: 10px; font-size: 1.1rem; }
        .product-price { color: #dc2626; font-size: 1.4rem; font-weight: 700; }
        .product-description { color: #666; margin-top: 10px; font-size: 0.9rem; }
        
        .footer { background: #333; color: white; padding: 40px 0; text-align: center; }
        .footer p { margin-bottom: 10px; }
        .footer a { color: #dc2626; text-decoration: none; }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .hero p { font-size: 1.1rem; }
            .hero .cta { flex-direction: column; align-items: center; }
            .header-content { flex-direction: column; gap: 20px; }
            .nav { flex-wrap: wrap; justify-content: center; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <img src="https://res.cloudinary.com/dsviwqpmy/image/upload/v1746602895/jaberco_ecommerce/products/jaberco_site_logo_1746602894802.jpg" alt="Jaberco Logo">
                </div>
                <nav class="nav">
                    <a href="#home">Home</a>
                    <a href="#products">Products</a>
                    <a href="#auctions">Auctions</a>
                    <a href="#about">About</a>
                    <a href="#contact">Contact</a>
                </nav>
            </div>
        </div>
    </div>
    
    <div class="container">
        <div class="hero" id="home">
            <h1>Welcome to Jaberco</h1>
            <p>Canada's Premier Amazon Return Pallet Marketplace</p>
            <p>Discover quality products at unbeatable prices from Amazon return pallets</p>
            <div class="cta">
                <a href="#products" class="btn btn-primary">Shop Now</a>
                <a href="#about" class="btn btn-secondary">Learn More</a>
            </div>
        </div>
        
        <div class="features">
            <div class="feature">
                <div class="feature-icon">🎯</div>
                <h3>Quality Products</h3>
                <p>Carefully curated Amazon return pallets with detailed condition reports and authentic product descriptions</p>
            </div>
            <div class="feature">
                <div class="feature-icon">💰</div>
                <h3>Unbeatable Prices</h3>
                <p>Save up to 70% on retail prices with our liquidation inventory and wholesale pricing</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🚚</div>
                <h3>Fast Shipping</h3>
                <p>Quick delivery across Canada with tracking information and secure packaging</p>
            </div>
        </div>
        
        <div class="products-section" id="products">
            <h2>Featured Products</h2>
            <div class="products" id="product-grid">
                <!-- Products will be loaded here -->
            </div>
        </div>
    </div>
    
    <div class="footer">
        <div class="container">
            <p>&copy; 2024 Jaberco. All rights reserved.</p>
            <p>Canada's trusted marketplace for Amazon return pallets</p>
            <p>Contact us: <a href="mailto:info@jaberco.ca">info@jaberco.ca</a></p>
        </div>
    </div>
    
    <script>
        // Load products
        fetch('/api/products')
            .then(response => response.json())
            .then(products => {
                const productGrid = document.getElementById('product-grid');
                productGrid.innerHTML = products.map(product => \`
                    <div class="product">
                        <img src="\${product.images[0]}" alt="\${product.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxNTAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5Qcm9kdWN0IEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
                        <div class="product-info">
                            <div class="product-title">\${product.title}</div>
                            <div class="product-price">$\${product.price}</div>
                            <div class="product-description">\${product.description}</div>
                        </div>
                    </div>
                \`).join('');
            })
            .catch(error => {
                console.error('Error loading products:', error);
                document.getElementById('product-grid').innerHTML = '<p>Loading products...</p>';
            });
        
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    </script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  });
  
  return app;
}

// Start the simple server
export function startReplitServer() {
  const app = createReplitServer();
  const port = parseInt(process.env.PORT || '5000');
  
  app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Jaberco server running on port ${port}`);
    console.log(`🌐 Visit: https://jaberco.replit.app`);
  });
}