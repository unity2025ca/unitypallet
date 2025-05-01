import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Middleware to require admin access
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
}

/**
 * Middleware to check if user has publisher role or is an admin
 */
export function requirePublisher(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || (req.user.roleType !== 'publisher' && !req.user.isAdmin)) {
    return res.status(403).json({ error: 'Access denied. Publisher role required.' });
  }
  next();
}

/**
 * Middleware to check if user can manage products (admin or publisher)
 */
export function canManageProducts(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || (req.user.roleType !== 'publisher' && !req.user.isAdmin)) {
    return res.status(403).json({ error: 'Access denied. Cannot manage products.' });
  }
  next();
}

/**
 * Middleware to check if user can manage appointments (admin or publisher)
 */
export function canManageAppointments(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || (req.user.roleType !== 'publisher' && !req.user.isAdmin)) {
    return res.status(403).json({ error: 'Access denied. Cannot manage appointments.' });
  }
  next();
}

/**
 * Middleware to authenticate customers
 */
export function authenticateCustomer(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated as customer' });
  }
  next();
}

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      cartId?: number;
    }
  }
}