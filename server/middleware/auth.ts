import { Request, Response, NextFunction } from 'express';

// Interface for authenticated request
export interface AuthenticatedRequest extends Request {
  user?: any; // User information will be attached by Passport
}

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Middleware to check if user is an admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ error: 'Requires admin privileges' });
};

// Middleware to check if user is a customer
export const authenticateCustomer = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user) {
    // In our system, anyone who is not an admin is considered a customer
    return next();
  }
  res.status(401).json({ error: 'Not authenticated as customer' });
};

// Check if user can manage products (admin or publisher with proper role)
export const canManageProducts = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user.isAdmin || (req.user.roleType === 'publisher'))) {
    return next();
  }
  res.status(403).json({ error: 'Not authorized to manage products' });
};

// Check if user can manage appointments (admin or staff with proper role)
export const canManageAppointments = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user.isAdmin || (req.user.roleType === 'publisher'))) {
    return next();
  }
  res.status(403).json({ error: 'Not authorized to manage appointments' });
};

// Check if user can manage orders (admin or staff with proper role)
export const canManageOrders = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user.isAdmin || (req.user.roleType === 'publisher'))) {
    return next();
  }
  res.status(403).json({ error: 'Not authorized to manage orders' });
};