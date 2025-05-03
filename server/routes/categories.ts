import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import { slugify } from "../utils/format";
import { requireAdmin, canManageProducts } from "../middleware/auth";
import { validate } from "../middleware/validation";

const router = Router();

// Get all categories
router.get("/api/categories", async (req: Request, res: Response) => {
  try {
    const categories = await storage.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Get a single category by ID
router.get("/api/categories/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const category = await storage.getCategoryById(id);
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

// Create a new category (admin only)
router.post(
  "/api/admin/categories",
  requireAdmin,
  validate(insertCategorySchema),
  async (req: Request, res: Response) => {
    try {
      // Generate slug from name
      if (!req.body.slug) {
        req.body.slug = slugify(req.body.name);
      }
      
      // Check if slug already exists
      const existingCategory = await storage.getCategoryBySlug(req.body.slug);
      if (existingCategory) {
        return res.status(400).json({ error: "A category with this slug already exists" });
      }
      
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  }
);

// Update an existing category (admin only)
router.put(
  "/api/admin/categories/:id",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate the request body
      const updateSchema = insertCategorySchema.partial();
      const result = updateSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ errors: result.error.errors });
      }
      
      // Generate slug from name if name is changed and slug isn't provided
      if (req.body.name && !req.body.slug) {
        req.body.slug = slugify(req.body.name);
      }
      
      // If slug is being updated, check it doesn't conflict
      if (req.body.slug) {
        const existingCategory = await storage.getCategoryBySlug(req.body.slug);
        if (existingCategory && existingCategory.id !== id) {
          return res.status(400).json({ error: "A category with this slug already exists" });
        }
      }
      
      const updatedCategory = await storage.updateCategory(id, req.body);
      
      if (!updatedCategory) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  }
);

// Delete a category (admin only)
router.delete(
  "/api/admin/categories/:id",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  }
);

export default router;