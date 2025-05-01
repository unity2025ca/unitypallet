import express, { Request, Response } from 'express';
import { storage } from '../storage';

const router = express.Router();

// Calculate shipping cost based on customer address
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    console.log('Shipping calculation request:', req.body);
    
    const { 
      city,
      province,
      postalCode,
      country
    } = req.body;

    if (!city || !province || !country) {
      console.log('Missing required fields:', { city, province, country });
      return res.status(400).json({ error: 'City, province and country are required' });
    }

    // Get warehouse locations
    const warehouses = await storage.getWarehouseLocations();
    console.log('Found warehouses:', warehouses.length);
    
    if (warehouses.length === 0) {
      // No warehouses configured, return a default shipping cost
      console.log('No warehouses configured, using default cost');
      return res.json({ shippingCost: 2000 }); // $20 default shipping in cents
    }

    // For now, use Toronto as the base location for shipping
    // This is a simplified approach until we have geocoding integrated
    const defaultLocation = await storage.getAllLocations();
    console.log('All locations:', defaultLocation.length);
    
    let customerLocation = defaultLocation.find(loc => 
      loc.city.toLowerCase() === city.toLowerCase() && 
      loc.province.toLowerCase() === province.toLowerCase()
    );
    
    // If we don't have the exact location, find a location in the same province
    if (!customerLocation) {
      console.log('Exact city match not found, looking for province match:', province);
      customerLocation = defaultLocation.find(loc => 
        loc.province.toLowerCase() === province.toLowerCase()
      );
    }

    // If still no location found, use first warehouse as default
    if (!customerLocation) {
      console.log('No location match found, using default cost');
      // Fallback to fixed shipping cost
      return res.json({ shippingCost: 3000 }); // $30 default for unknown locations
    }
    
    console.log('Found customer location:', { 
      id: customerLocation.id,
      city: customerLocation.city,
      province: customerLocation.province
    });

    // Find the lowest shipping cost from any warehouse to the customer's location
    const shippingCosts = await Promise.all(
      warehouses.map(async (warehouse) => {
        console.log('Calculating shipping from warehouse:', warehouse.id, 'to location:', customerLocation!.id);
        try {
          const cost = await storage.calculateShippingCost(
            warehouse.id,
            customerLocation!.id
          );
          console.log('Calculated cost:', cost);
          return cost;
        } catch (err) {
          console.error('Error in calculateShippingCost:', err);
          return Number.MAX_SAFE_INTEGER; // Use a high value so it won't be selected as minimum
        }
      })
    );

    console.log('All shipping costs:', shippingCosts);
    
    // Handle case where all shipping calculations failed
    if (shippingCosts.length === 0 || shippingCosts.every(cost => cost === Number.MAX_SAFE_INTEGER)) {
      console.log('All shipping calculations failed, using default cost');
      return res.json({ shippingCost: 3500 }); // $35 default when calculation fails
    }

    // Use the lowest shipping cost from all warehouses, excluding MAX_SAFE_INTEGER values
    const validCosts = shippingCosts.filter(cost => cost !== Number.MAX_SAFE_INTEGER);
    const shippingCost = Math.min(...validCosts);
    
    console.log('Final shipping cost:', shippingCost);
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