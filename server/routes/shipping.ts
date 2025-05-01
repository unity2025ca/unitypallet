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

    // Get all locations from database
    const allLocations = await storage.getAllLocations();
    console.log('All locations:', allLocations.length);
    
    // First try to find exact city and province match
    let customerLocation = allLocations.find(loc => 
      loc.city.toLowerCase().trim() === city.toLowerCase().trim() && 
      loc.province.toLowerCase().trim() === province.toLowerCase().trim()
    );
    
    // If exact match not found, try looking for city name that contains the customer city
    if (!customerLocation) {
      console.log('Exact city/province match not found, looking for partial city match');
      customerLocation = allLocations.find(loc => 
        loc.city.toLowerCase().includes(city.toLowerCase().trim()) && 
        loc.province.toLowerCase().trim() === province.toLowerCase().trim()
      );
    }
    
    // If still not found, try only province match
    if (!customerLocation) {
      console.log('Partial city match not found, looking for province match:', province);
      customerLocation = allLocations.find(loc => 
        loc.province.toLowerCase().trim() === province.toLowerCase().trim()
      );
    }

    // If still no location found, create temporary location for customer with closest warehouse coordinates
    if (!customerLocation) {
      console.log('No location match found at all, using warehouse as reference');
      
      // Use the first warehouse as reference point
      if (warehouses.length > 0) {
        const referenceWarehouse = warehouses[0];
        console.log('Using reference warehouse:', referenceWarehouse.id, referenceWarehouse.city);
        
        // Create temporary customer location with the same coordinates but flag as non-warehouse
        customerLocation = {
          id: -1, // Temporary ID
          city: city,
          province: province,
          country: country,
          postalCode: postalCode || '',
          latitude: referenceWarehouse.latitude,
          longitude: referenceWarehouse.longitude,
          isWarehouse: false,
          zoneId: referenceWarehouse.zoneId,
          createdAt: new Date() // Required by the type
        };
        
        // Return fixed shipping cost plus a distance premium
        const fixedCost = 2500; // $25 base cost in cents
        console.log('Using fixed shipping cost for unknown location:', fixedCost);
        return res.json({ shippingCost: fixedCost });
      } else {
        // No warehouses and no matching location, use absolute default
        console.log('No warehouses and no matching location, using absolute default cost');
        return res.json({ shippingCost: 3000 }); // $30 default in cents
      }
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