import express, { Request, Response } from 'express';
import { storage } from '../storage';

const router = express.Router();

// Utility function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Radius of the Earth in kilometers
  const R = 6371;
  
  // Convert latitude and longitude from degrees to radians
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  // Haversine formula
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return parseFloat(distance.toFixed(2)); // Round to 2 decimal places
}

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
    
    // Instead of relying on existing locations, we'll create a custom customer location based on input
    // and validate based on coordinates and distance calculation
    
    // Get a reference location (preferably from warehouse)
    console.log('Creating temporary location based on customer input');
    
    // Find a reference location for coordinates
    const referenceLocation = warehouses.length > 0 ? warehouses[0] : allLocations[0];
    
    if (!referenceLocation) {
      console.log('No reference location found for coordinates');
      return res.status(400).json({ 
        error: 'Shipping unavailable',
        details: 'Unable to calculate shipping to your location' 
      });
    }
    
    // Try to find exact coordinates for this city/province using Google Maps API or a geocoding service
    // For now, we'll use a rough estimate based on major cities' coordinates
    // This is a simplified example - in production you'd want to use a proper geocoding service
    
    // Get the warehouse's zone and its max distance limit
    const warehouse = warehouses[0];
    
    // Check if warehouse has a zoneId set
    if (!warehouse.zoneId) {
      console.log('Warehouse has no zoneId set');
      return res.status(400).json({ 
        error: 'Shipping unavailable',
        details: 'Shipping configuration issue - please contact support' 
      });
    }
    
    const warehouseZone = await storage.getShippingZoneById(warehouse.zoneId);
    
    if (!warehouseZone || !warehouseZone.maxDistanceLimit) {
      console.log('No max distance limit set for warehouse zone');
      return res.status(400).json({ 
        error: 'Shipping unavailable',
        details: 'Shipping configuration issue - please contact support' 
      });
    }
    
    // Set a hard limit of 60km for all shipping, regardless of zone settings
    const maxDistanceLimit = Math.min(warehouseZone.maxDistanceLimit, 60); // Force 60km max
    console.log(`Setting strict maximum distance limit to ${maxDistanceLimit}km`);
    
    // Create a custom location based on the provided address
    // In a real app, you would use a geocoding service to get actual coordinates
    // For this demo, we'll generate coordinates based on the city name and province
    let customLatitude, customLongitude;
    
    // Common cities in Canada with their coordinates
    const cityCoordinates: Record<string, {lat: string, lon: string}> = {
      'toronto': { lat: '43.6532', lon: '-79.3832' },
      'montreal': { lat: '45.5017', lon: '-73.5673' },
      'vancouver': { lat: '49.2827', lon: '-123.1207' },
      'calgary': { lat: '51.0447', lon: '-114.0719' },
      'edmonton': { lat: '53.5461', lon: '-113.4938' },
      'ottawa': { lat: '45.4215', lon: '-75.6972' },
      'winnipeg': { lat: '49.8951', lon: '-97.1384' },
      'quebec city': { lat: '46.8139', lon: '-71.2080' },
      'hamilton': { lat: '43.2557', lon: '-79.8711' },
      'brampton': { lat: '43.7315', lon: '-79.7624' },
      'kitchener': { lat: '43.4516', lon: '-80.4925' },
      'london': { lat: '42.9849', lon: '-81.2453' },
      'victoria': { lat: '48.4284', lon: '-123.3656' },
      'halifax': { lat: '44.6488', lon: '-63.5752' },
      'niagara falls': { lat: '43.0896', lon: '-79.0849' },
      'windsor': { lat: '42.3149', lon: '-83.0364' },
      'oshawa': { lat: '43.8971', lon: '-78.8658' },
      'saskatoon': { lat: '52.1332', lon: '-106.6700' },
      'barrie': { lat: '44.3894', lon: '-79.6903' },
      'guelph': { lat: '43.5448', lon: '-80.2482' },
      'kingston': { lat: '44.2312', lon: '-76.4860' },
      'regina': { lat: '50.4452', lon: '-104.6189' },
      'burnaby': { lat: '49.2488', lon: '-122.9805' },
      'mississauga': { lat: '43.5890', lon: '-79.6441' },
      'markham': { lat: '43.8561', lon: '-79.3370' },
    };
    
    // Lookup coordinates or use warehouse coordinates as fallback
    const normalizedCity = city.toLowerCase().trim();
    
    if (cityCoordinates[normalizedCity]) {
      customLatitude = cityCoordinates[normalizedCity].lat;
      customLongitude = cityCoordinates[normalizedCity].lon;
      console.log(`Found coordinates for ${city}: lat=${customLatitude}, lon=${customLongitude}`);
    } else {
      // Try partial city name match
      const partialMatch = Object.keys(cityCoordinates).find(key => 
        normalizedCity.includes(key) || key.includes(normalizedCity)
      );
      
      if (partialMatch) {
        customLatitude = cityCoordinates[partialMatch].lat;
        customLongitude = cityCoordinates[partialMatch].lon;
        console.log(`Found partial match coordinates for ${city} using ${partialMatch}: lat=${customLatitude}, lon=${customLongitude}`);
      } else {
        // No matching city, use random coordinates within 30-120km range from warehouse
        // This simulates customers at varying distances
        
        // Generate a random distance between 30km and 120km
        const randomDistance = Math.floor(Math.random() * (120 - 30 + 1)) + 30;
        
        // Generate a random angle in radians
        const randomAngle = Math.random() * 2 * Math.PI;
        
        // Default to warehouse coordinates plus random offset
        // In a real system, you'd use a geocoding service
        console.log(`No coordinate match found for ${city}, using simulated location ${randomDistance}km from warehouse`);
        
        // Treat unrecognized cities as out of range for safety
        console.log('Unrecognized location, treating as out of range');
        return res.status(400).json({ 
          error: 'Shipping unavailable',
          details: 'Your location is outside our delivery range or not recognized in our system' 
        });
      }
    }
    
    // Distance is calculated in km using the Haversine formula
    const distanceFromWarehouse = calculateDistance(
      parseFloat(warehouse.latitude), 
      parseFloat(warehouse.longitude),
      parseFloat(customLatitude || warehouse.latitude), 
      parseFloat(customLongitude || warehouse.longitude)
    );
    
    console.log(`Distance from warehouse: ${distanceFromWarehouse}km, Max allowed: ${maxDistanceLimit}km`);
    
    // Check if distance exceeds max distance limit
    if (distanceFromWarehouse > maxDistanceLimit) {
      console.log('Location exceeds maximum delivery distance');
      return res.status(400).json({ 
        error: 'Out of service',
        details: 'Your location is outside our delivery range - maximum 60km distance' 
      });
    }
    
    // Create a temporary customer location with the correct coordinates
    const customerLocation = {
      id: -999, // Special temporary ID for custom locations
      city: city,
      province: province,
      country: country,
      postalCode: postalCode || '',
      latitude: customLatitude || warehouse.latitude,
      longitude: customLongitude || warehouse.longitude,
      isWarehouse: false,
      zoneId: warehouse.zoneId,
      createdAt: new Date()
    };
    
    console.log('Found customer location:', { 
      id: customerLocation.id,
      city: customerLocation.city,
      province: customerLocation.province
    });

    // Instead of using storage.calculateShippingCost which relies on database IDs,
    // We'll directly calculate the cost based on coordinates for this custom location
    const shippingCosts = await Promise.all(
      warehouses.map(async (warehouse) => {
        console.log('Calculating shipping from warehouse:', warehouse.id, 'to custom location:', customerLocation.city);
        try {
          // Get warehouse's zone information for rate calculation
          let zoneId = warehouse.zoneId;
          if (!zoneId) {
            console.log('Warehouse has no zone ID, using default shipping');
            return 2500; // Default shipping cost for warehouses without zones
          }
          
          // Get rates for this zone
          const rates = await storage.getShippingRatesByZoneId(zoneId);
          if (!rates || rates.length === 0) {
            console.log('No shipping rates defined for zone', zoneId);
            return 2000; // Default cost when no rates are defined
          }
          
          // Calculate the distance between warehouse and customer location using our Haversine function
          const distance = calculateDistance(
            parseFloat(warehouse.latitude),
            parseFloat(warehouse.longitude),
            parseFloat(customLatitude || warehouse.latitude),
            parseFloat(customLongitude || warehouse.longitude)
          );
          
          console.log(`Calculated distance from warehouse ${warehouse.id} to ${customerLocation.city}: ${distance}km`);
          
          // Check if distance exceeds the max distance limit for this zone
          if (distance > maxDistanceLimit) {
            console.log(`Distance ${distance}km exceeds zone limit of ${maxDistanceLimit}km`);
            return -1; // -1 indicates outside delivery range
          }
          
          // Find the applicable rate for this distance
          const applicableRate = rates.find(rate => 
            distance >= rate.minDistance && 
            distance <= rate.maxDistance && 
            rate.isActive
          );
          
          if (!applicableRate) {
            console.log('No applicable shipping rate found for distance', distance);
            return -1; // Outside shipping range
          }
          
          // Calculate shipping cost based on distance
          let cost = applicableRate.baseRate;
          
          // Add additional cost per km if applicable
          const additionalDistance = Math.max(0, distance - applicableRate.minDistance);
          const additionalCost = Math.round(additionalDistance * applicableRate.additionalRatePerKm);
          cost += additionalCost;
          
          console.log('Calculated shipping cost:', {
            baseRate: applicableRate.baseRate,
            additionalDistance,
            additionalCost,
            totalCost: cost
          });
          
          return cost;
        } catch (err) {
          console.error('Error calculating shipping cost:', err);
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