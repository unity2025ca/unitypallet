import { Request, Response, NextFunction } from "express";

/**
 * Middleware to set security headers for all HTTP responses
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Content Security Policy
  // Customize as needed based on your application requirements
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://replit.com https://cdnjs.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
    "img-src 'self' data: https://*.cloudinary.com https://*.amazonaws.com https://images.unsplash.com https://upload.wikimedia.org https://res.cloudinary.com https://img.youtube.com https://*.google.com https://*.googleapis.com https://maps.gstatic.com; " +
    "connect-src 'self' https://api.stripe.com https://*.cloudinary.com https://*.google.com https://*.googleapis.com; " +
    "frame-src 'self' https://js.stripe.com https://www.google.com https://*.google.com https://maps.google.com https://*.googleapis.com https://www.youtube.com; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );

  // X-Content-Type-Options
  // Prevents browsers from MIME-sniffing a response away from the declared content-type
  res.setHeader("X-Content-Type-Options", "nosniff");

  // X-Frame-Options
  // Restricts who can put your site in a frame (clickjacking protection)
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // X-XSS-Protection
  // Enables the cross-site scripting (XSS) filter in some browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer-Policy
  // Controls how much referrer information should be included with requests
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy (formerly Feature-Policy)
  // Controls which browser features can be used on the site
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=(self)"
  );

  // HTTP Strict Transport Security
  // Enforces secure (HTTPS) connections to the server for a specific period
  // Only enable in production with HTTPS
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  next();
}

/**
 * Middleware to set CORS headers
 */
export function corsHeaders(req: Request, res: Response, next: NextFunction) {
  // Allow requests only from your domain in production
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://jaberco.com', 'https://www.jaberco.com'] 
    : '*';
    
  res.setHeader(
    'Access-Control-Allow-Origin', 
    Array.isArray(allowedOrigins) ? allowedOrigins.join(', ') : allowedOrigins
  );
  
  // Allow certain headers
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  
  // Allow certain methods
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );
  
  // Allow credentials
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}