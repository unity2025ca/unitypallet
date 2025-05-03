import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Middleware for validating request body against a Zod schema
 * @param schema The Zod schema to validate against
 * @returns Express middleware function
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: result.error.errors
        });
      }
      
      // Update the request body with the parsed and validated data
      req.body = result.data;
      next();
    } catch (error) {
      console.error("Validation error:", error);
      res.status(500).json({ error: "Internal server error during validation" });
    }
  };
}