import express, { Request, Response } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";
import { insertAllowedCitySchema } from "@shared/schema";
import { z } from "zod";

const router = express.Router();

// Get all allowed cities (admin)
router.get("/api/admin/allowed-cities", requireAdmin, async (req: Request, res: Response) => {
  try {
    const cities = await storage.getAllAllowedCities();
    res.json(cities);
  } catch (error: any) {
    console.error("Error fetching allowed cities:", error);
    res.status(500).json({ error: "Failed to fetch allowed cities", details: error.message });
  }
});

// Get a specific allowed city by ID (admin)
router.get("/api/admin/allowed-cities/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const city = await storage.getAllowedCityById(id);
    
    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }
    
    res.json(city);
  } catch (error: any) {
    console.error(`Error fetching allowed city with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch city", details: error.message });
  }
});

// Create a new allowed city (admin)
router.post("/api/admin/allowed-cities", requireAdmin, async (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const cityData = insertAllowedCitySchema.parse(req.body);
    
    // Normalize city name to prevent duplicates with different casing
    cityData.cityName = cityData.cityName.trim();
    
    const newCity = await storage.createAllowedCity(cityData);
    res.status(201).json(newCity);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid city data", details: error.errors });
    } else if (error.code === '23505') { // PostgreSQL unique constraint violation
      res.status(409).json({ error: "City already exists", details: "A city with this name already exists" });
    } else {
      console.error("Error creating allowed city:", error);
      res.status(500).json({ error: "Failed to create city", details: error.message });
    }
  }
});

// Update an allowed city (admin)
router.put("/api/admin/allowed-cities/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Validate request body against schema
    const cityData = insertAllowedCitySchema.parse(req.body);
    
    // Normalize city name to prevent duplicates with different casing
    cityData.cityName = cityData.cityName.trim();
    
    const updatedCity = await storage.updateAllowedCity(id, cityData);
    
    if (!updatedCity) {
      return res.status(404).json({ error: "City not found" });
    }
    
    res.json(updatedCity);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid city data", details: error.errors });
    } else if (error.code === '23505') { // PostgreSQL unique constraint violation
      res.status(409).json({ error: "City name conflict", details: "A city with this name already exists" });
    } else {
      console.error(`Error updating allowed city with ID ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to update city", details: error.message });
    }
  }
});

// Toggle city status (active/inactive) (admin)
router.patch("/api/admin/allowed-cities/:id/status", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { isActive } = req.body;
    
    // Validate isActive is a boolean
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: "Invalid status value", details: "Status must be a boolean" });
    }
    
    const updatedCity = await storage.updateAllowedCity(id, { isActive });
    
    if (!updatedCity) {
      return res.status(404).json({ error: "City not found" });
    }
    
    res.json(updatedCity);
  } catch (error: any) {
    console.error(`Error updating city status with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to update city status", details: error.message });
  }
});

// Delete an allowed city (admin)
router.delete("/api/admin/allowed-cities/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteAllowedCity(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "City not found" });
    }
    
    res.status(200).json({ success: true, message: "City deleted successfully" });
  } catch (error: any) {
    console.error(`Error deleting allowed city with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to delete city", details: error.message });
  }
});

// Public API to check if delivery is available to a specific city
router.get("/api/shipping/is-city-allowed", async (req: Request, res: Response) => {
  try {
    const { city } = req.query;
    
    if (!city || typeof city !== 'string') {
      return res.status(400).json({ 
        error: "Missing city parameter", 
        details: "City name must be provided" 
      });
    }
    
    const isAllowed = await storage.isCityAllowed(city);
    
    res.json({ 
      city: city.trim(), 
      isAllowed,
      message: isAllowed 
        ? "Delivery is available to this location" 
        : "Sorry, we do not deliver to this location"
    });
  } catch (error: any) {
    console.error("Error checking if city is allowed:", error);
    res.status(500).json({ error: "Failed to check city status", details: error.message });
  }
});

// Get all active allowed cities (public)
router.get("/api/shipping/allowed-cities", async (req: Request, res: Response) => {
  try {
    const cities = await storage.getAllActiveAllowedCities();
    res.json(cities);
  } catch (error: any) {
    console.error("Error fetching active allowed cities:", error);
    res.status(500).json({ error: "Failed to fetch allowed cities", details: error.message });
  }
});

export default router;