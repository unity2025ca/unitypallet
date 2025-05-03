import { Router, Request, Response } from "express";
import { db } from "../db";
import { categories, insertCategorySchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import slugify from "slugify";
import { requireAdmin } from "../middleware/auth";
import { validateSchema } from "../middleware/validation";

const router = Router();

// Get all categories
router.get("/api/categories", async (_req: Request, res: Response) => {
  try {
    const allCategories = await db.select().from(categories);
    res.json(allCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Get a single category by ID
router.get("/api/categories/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }
    
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId));
    
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
  validateSchema(insertCategorySchema),
  async (req: Request, res: Response) => {
    try {
      let { name, nameAr, slug, description, descriptionAr, displayOrder } = req.body;
      
      // Generate slug if not provided
      if (!slug) {
        slug = slugify(name, { lower: true, strict: true });
      }
      
      // Check if slug is already in use
      const [existingCategory] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, slug));
      
      if (existingCategory) {
        return res.status(400).json({ error: "Slug already in use" });
      }
      
      // If no display order specified, place at the end
      if (displayOrder === undefined) {
        const result = await db
          .select({ maxOrder: db.fn.max(categories.displayOrder) })
          .from(categories);
        
        displayOrder = result[0].maxOrder ? (result[0].maxOrder + 10) : 10;
      }
      
      // Insert the new category
      const [newCategory] = await db
        .insert(categories)
        .values({
          name,
          nameAr,
          slug,
          description,
          descriptionAr,
          displayOrder,
        })
        .returning();
      
      res.status(201).json(newCategory);
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
      const { id } = req.params;
      const categoryId = parseInt(id);
      
      if (isNaN(categoryId)) {
        return res.status(400).json({ error: "Invalid category ID" });
      }
      
      // Verify category exists
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, categoryId));
      
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      let { name, nameAr, slug, description, descriptionAr, displayOrder } = req.body;
      
      // Generate slug if name changed and slug not provided
      if (name !== category.name && !slug) {
        slug = slugify(name, { lower: true, strict: true });
      }
      
      // Check if new slug is already in use by another category
      if (slug && slug !== category.slug) {
        const [existingCategory] = await db
          .select()
          .from(categories)
          .where(eq(categories.slug, slug));
        
        if (existingCategory && existingCategory.id !== categoryId) {
          return res.status(400).json({ error: "Slug already in use" });
        }
      }
      
      // Update the category
      const [updatedCategory] = await db
        .update(categories)
        .set({
          name: name || category.name,
          nameAr: nameAr || category.nameAr,
          slug: slug || category.slug,
          description: description !== undefined ? description : category.description,
          descriptionAr: descriptionAr !== undefined ? descriptionAr : category.descriptionAr,
          displayOrder: displayOrder !== undefined ? displayOrder : category.displayOrder,
        })
        .where(eq(categories.id, categoryId))
        .returning();
      
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
      const { id } = req.params;
      const categoryId = parseInt(id);
      
      if (isNaN(categoryId)) {
        return res.status(400).json({ error: "Invalid category ID" });
      }
      
      // Verify category exists
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, categoryId));
      
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      // Delete the category
      await db
        .delete(categories)
        .where(eq(categories.id, categoryId));
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  }
);

export default router;