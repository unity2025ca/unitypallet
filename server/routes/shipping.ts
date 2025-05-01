import express, { Request, Response } from 'express';
import { storage } from '../storage';
import { getAddressCoordinates } from '../utils/geocoding';

const router = express.Router();

// Calculate shipping cost based on customer address
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const { 
      address,
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

    // Combine the address parts
    const fullAddress = `${address}, ${city}, ${province}, ${postalCode}, ${country}`;
    
    // Get coordinates for the customer address
    const destinationCoordinates = await getAddressCoordinates(fullAddress);
    
    if (!destinationCoordinates) {
      // Could not geocode the address, return default shipping cost
      return res.json({ shippingCost: 2000 }); // $20 default shipping
    }

    // Find the closest warehouse
    const shippingCosts = await Promise.all(
      warehouses.map(async (warehouse) => {
        // Calculate shipping cost from this warehouse to customer address
        return storage.calculateShippingCostByCoordinates(
          parseFloat(warehouse.latitude),
          parseFloat(warehouse.longitude),
          destinationCoordinates.lat,
          destinationCoordinates.lng,
          warehouse.zoneId || undefined
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