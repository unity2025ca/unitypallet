import express, { Request, Response } from 'express';
import { storage } from '../storage';

const router = express.Router();

// Calculate shipping cost based on customer address
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const { 
      city,
      province,
      postalCode,
      country
    } = req.body;

    if (!city || !province || !country) {
      return res.status(400).json({ error: 'City, province and country are required' });
    }

    // Get warehouse locations
    const warehouses = await storage.getWarehouseLocations();
    
    if (warehouses.length === 0) {
      // No warehouses configured, return a default shipping cost
      return res.json({ shippingCost: 2000 }); // $20 default shipping in cents
    }

    // For now, use Toronto as the base location for shipping
    // This is a simplified approach until we have geocoding integrated
    const defaultLocation = await storage.getAllLocations();
    let customerLocation = defaultLocation.find(loc => 
      loc.city.toLowerCase() === city.toLowerCase() && 
      loc.province.toLowerCase() === province.toLowerCase()
    );
    
    // If we don't have the exact location, find a location in the same province
    if (!customerLocation) {
      customerLocation = defaultLocation.find(loc => 
        loc.province.toLowerCase() === province.toLowerCase()
      );
    }

    // If still no location found, use first warehouse as default
    if (!customerLocation) {
      // Fallback to fixed shipping cost
      return res.json({ shippingCost: 3000 }); // $30 default for unknown locations
    }

    // Find the lowest shipping cost from any warehouse to the customer's location
    const shippingCosts = await Promise.all(
      warehouses.map(async (warehouse) => {
        return storage.calculateShippingCost(
          warehouse.id,
          customerLocation!.id
        );
      })
    );

    // Use the lowest shipping cost from all warehouses
    const shippingCost = Math.min(...shippingCosts);
    
    res.json({ shippingCost });
  } catch (error: any) {
    console.error('Error calculating shipping cost:', error);
    res.status(500).json({ 
      error: 'Failed to calculate shipping cost', 
      details: error.message || error.toString() 
    });
  }
});

export default router;