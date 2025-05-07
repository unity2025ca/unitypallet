import { Request, Response, NextFunction } from "express";

interface LoginAttempt {
  attempts: number;
  lastAttempt: number;
  lockUntil: number | null;
}

// In-memory store for tracking login attempts (should be replaced with Redis in production)
const loginAttempts = new Map<string, LoginAttempt>();

// Settings
const MAX_ATTEMPTS = 5; // Maximum failed attempts before locking
const LOCK_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds
const ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds - window to count failed attempts

/**
 * Cleans up old entries from the login attempts tracker
 */
function cleanupLoginAttempts() {
  const now = Date.now();
  for (const [key, attempt] of loginAttempts.entries()) {
    // Remove entries where lock has expired or last attempt is older than our tracking window
    if ((attempt.lockUntil !== null && attempt.lockUntil < now) || 
        (attempt.lastAttempt < now - ATTEMPT_WINDOW)) {
      loginAttempts.delete(key);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupLoginAttempts, 60 * 60 * 1000);

/**
 * Middleware to protect against brute force attacks
 * @param keyGenerator Function to extract identifier (like IP or username) from request
 */
export function bruteForceProtection(
  keyGenerator: (req: Request) => string = (req) => req.ip || 'unknown'
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Skip for non-authentication endpoints
    if (!req.path.includes('/login') && !req.path.includes('/register')) {
      return next();
    }
    
    let attempt = loginAttempts.get(key);
    
    // If no record exists or it's expired, create a new one
    if (!attempt) {
      attempt = {
        attempts: 0,
        lastAttempt: now,
        lockUntil: null
      };
      loginAttempts.set(key, attempt);
    }
    
    // Check if the account is currently locked
    if (attempt.lockUntil !== null && attempt.lockUntil > now) {
      const waitMinutes = Math.ceil((attempt.lockUntil - now) / (60 * 1000));
      return res.status(429).json({
        error: 'Too many failed attempts',
        message: `Account is temporarily locked. Please try again in ${waitMinutes} minute(s).`
      });
    }
    
    // Track this attempt for failed logins later
    req.on('end', () => {
      // Check if this was a failed login (status code 401)
      if (res.statusCode === 401) {
        attempt = loginAttempts.get(key) || {
          attempts: 0,
          lastAttempt: now,
          lockUntil: null
        };
        
        attempt.attempts += 1;
        attempt.lastAttempt = now;
        
        // Lock account if too many failed attempts
        if (attempt.attempts >= MAX_ATTEMPTS) {
          attempt.lockUntil = now + LOCK_WINDOW;
        }
        
        loginAttempts.set(key, attempt);
      } else if (res.statusCode === 200 || res.statusCode === 201) {
        // Successful login - reset the counter
        loginAttempts.delete(key);
      }
    });
    
    next();
  };
}

/**
 * Middleware to track failed login attempts by username
 */
export function usernameBruteForceProtection() {
  return bruteForceProtection((req) => {
    const body = req.body || {};
    return body.username || req.ip || 'unknown';
  });
}

/**
 * Middleware to track failed login attempts by IP
 */
export function ipBruteForceProtection() {
  return bruteForceProtection((req) => req.ip || 'unknown');
}