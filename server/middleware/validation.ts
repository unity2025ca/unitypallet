import { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Middleware factory for validating request body against a Zod schema
 * @param schema The Zod schema to validate against
 * @returns Express middleware function
 */
export function validateSchema(schema: z.ZodType<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        // Format Zod errors into a more readable format
        const formattedErrors = result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({ 
          error: "Validation failed", 
          details: formattedErrors 
        });
      }
      
      // Replace req.body with the validated and transformed data
      req.body = result.data;
      next();
    } catch (error) {
      console.error("Validation error:", error);
      res.status(500).json({ error: "Server error during validation" });
    }
  };
}

/**
 * Middleware to validate query parameters
 * @param schema Zod schema for query validation
 */
export function validateQuery(schema: z.ZodType<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const formattedErrors = result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({ 
          error: "Query validation failed", 
          details: formattedErrors 
        });
      }
      
      req.query = result.data;
      next();
    } catch (error) {
      console.error("Query validation error:", error);
      res.status(500).json({ error: "Server error during query validation" });
    }
  };
}

/**
 * Middleware to validate URL parameters
 * @param schema Zod schema for URL parameters validation
 */
export function validateParams(schema: z.ZodType<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        const formattedErrors = result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({ 
          error: "URL parameter validation failed", 
          details: formattedErrors 
        });
      }
      
      req.params = result.data;
      next();
    } catch (error) {
      console.error("URL parameter validation error:", error);
      res.status(500).json({ error: "Server error during URL parameter validation" });
    }
  };
}