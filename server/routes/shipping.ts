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

    // If still no location found, treat as outside delivery range
    if (!customerLocation) {
      console.log('No location match found at all - treating as outside delivery range');
      return res.status(400).json({ 
        error: 'Shipping unavailable',
        details: 'Your location is outside our delivery range or not recognized in our system' 
      });
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
    
    // Check if any locations are outside delivery range (indicated by cost of -1)
    const allOutsideRange = shippingCosts.every(cost => cost === -1);
    if (allOutsideRange) {
      console.log('All warehouses are too far away - outside maximum delivery range');
      return res.status(400).json({ 
        error: 'Shipping unavailable',
        details: 'Your location is outside our delivery range' 
      });
    }
    
    // Handle case where all shipping calculations failed
    if (shippingCosts.length === 0 || shippingCosts.every(cost => cost === Number.MAX_SAFE_INTEGER)) {
      console.log('All shipping calculations failed - treating as outside range');
      return res.status(400).json({ 
        error: 'Shipping unavailable',
        details: 'Unable to calculate shipping to your location' 
      });
    }

    // Count how many locations are outside range (indicated by -1)
    const outsideRangeCounts = shippingCosts.filter(cost => cost === -1).length;
    
    // If more than 50% of warehouses indicate the location is outside range, consider it out of range
    if (outsideRangeCounts > 0 && outsideRangeCounts >= Math.ceil(shippingCosts.length / 2)) {
      console.log(`${outsideRangeCounts} of ${shippingCosts.length} warehouses indicate location is outside range - treating as outside range`);
      return res.status(400).json({ 
        error: 'Shipping unavailable',
        details: 'Your location is outside our delivery range' 
      });
    }
    
    // Use the lowest shipping cost from all warehouses, excluding invalid values (-1 for outside range and MAX_SAFE_INTEGER for errors)
    const validCosts = shippingCosts.filter(cost => cost !== Number.MAX_SAFE_INTEGER && cost !== -1);
    
    // If no valid costs, treat as outside range
    if (validCosts.length === 0) {
      console.log('No valid shipping costs found - treating as outside range');
      return res.status(400).json({ 
        error: 'Shipping unavailable',
        details: 'Your location is outside our delivery range' 
      });
    }
    
    const shippingCost = Math.min(...validCosts);
    
    // Double-check if shipping cost is 0 or negative, which would be incorrect
    if (shippingCost <= 0) {
      console.log('Invalid shipping cost detected:', shippingCost);
      return res.status(400).json({ 
        error: 'Shipping unavailable',
        details: 'Invalid shipping cost calculated for your location' 
      });
    }
    
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