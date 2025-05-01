import express from 'express';
import { storage } from '../storage';
import { insertShippingZoneSchema, insertShippingRateSchema, insertLocationSchema } from '@shared/schema';

const router = express.Router();

// No middleware needed here - already protected by requireAdmin in the main routes.ts file

// Shipping zones
router.get('/zones', async (req, res) => {
  try {
    const zones = await storage.getAllShippingZones();
    res.json(zones);
  } catch (error) {
    console.error('Error getting shipping zones:', error);
    res.status(500).json({ error: 'Failed to get shipping zones' });
  }
});

router.get('/zones/:id', async (req, res) => {
  try {
    const zoneId = parseInt(req.params.id);
    const zone = await storage.getShippingZoneById(zoneId);
    
    if (!zone) {
      return res.status(404).json({ error: 'Shipping zone not found' });
    }
    
    res.json(zone);
  } catch (error) {
    console.error('Error getting shipping zone:', error);
    res.status(500).json({ error: 'Failed to get shipping zone' });
  }
});

router.post('/zones', async (req, res) => {
  try {
    const zoneData = insertShippingZoneSchema.parse(req.body);
    const newZone = await storage.createShippingZone(zoneData);
    res.status(201).json(newZone);
  } catch (error) {
    console.error('Error creating shipping zone:', error);
    res.status(400).json({ error: 'Failed to create shipping zone', details: error.toString() });
  }
});

router.put('/zones/:id', async (req, res) => {
  try {
    const zoneId = parseInt(req.params.id);
    const zoneData = insertShippingZoneSchema.partial().parse(req.body);
    
    const updatedZone = await storage.updateShippingZone(zoneId, zoneData);
    
    if (!updatedZone) {
      return res.status(404).json({ error: 'Shipping zone not found' });
    }
    
    res.json(updatedZone);
  } catch (error) {
    console.error('Error updating shipping zone:', error);
    res.status(400).json({ error: 'Failed to update shipping zone', details: error.toString() });
  }
});

router.delete('/zones/:id', async (req, res) => {
  try {
    const zoneId = parseInt(req.params.id);
    const success = await storage.deleteShippingZone(zoneId);
    
    if (!success) {
      return res.status(404).json({ error: 'Shipping zone not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting shipping zone:', error);
    res.status(500).json({ error: 'Failed to delete shipping zone' });
  }
});

// Shipping rates
router.get('/rates', async (req, res) => {
  try {
    const rates = await storage.getAllShippingRates();
    res.json(rates);
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    res.status(500).json({ error: 'Failed to get shipping rates' });
  }
});

router.get('/zones/:zoneId/rates', async (req, res) => {
  try {
    const zoneId = parseInt(req.params.zoneId);
    const rates = await storage.getShippingRatesByZoneId(zoneId);
    res.json(rates);
  } catch (error) {
    console.error('Error getting shipping rates for zone:', error);
    res.status(500).json({ error: 'Failed to get shipping rates for zone' });
  }
});

router.get('/rates/:id', async (req, res) => {
  try {
    const rateId = parseInt(req.params.id);
    const rate = await storage.getShippingRateById(rateId);
    
    if (!rate) {
      return res.status(404).json({ error: 'Shipping rate not found' });
    }
    
    res.json(rate);
  } catch (error) {
    console.error('Error getting shipping rate:', error);
    res.status(500).json({ error: 'Failed to get shipping rate' });
  }
});

router.post('/rates', async (req, res) => {
  try {
    const rateData = insertShippingRateSchema.parse(req.body);
    const newRate = await storage.createShippingRate(rateData);
    res.status(201).json(newRate);
  } catch (error) {
    console.error('Error creating shipping rate:', error);
    res.status(400).json({ error: 'Failed to create shipping rate', details: error.toString() });
  }
});

router.put('/rates/:id', async (req, res) => {
  try {
    const rateId = parseInt(req.params.id);
    const rateData = insertShippingRateSchema.partial().parse(req.body);
    
    const updatedRate = await storage.updateShippingRate(rateId, rateData);
    
    if (!updatedRate) {
      return res.status(404).json({ error: 'Shipping rate not found' });
    }
    
    res.json(updatedRate);
  } catch (error) {
    console.error('Error updating shipping rate:', error);
    res.status(400).json({ error: 'Failed to update shipping rate', details: error.toString() });
  }
});

router.delete('/rates/:id', async (req, res) => {
  try {
    const rateId = parseInt(req.params.id);
    const success = await storage.deleteShippingRate(rateId);
    
    if (!success) {
      return res.status(404).json({ error: 'Shipping rate not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting shipping rate:', error);
    res.status(500).json({ error: 'Failed to delete shipping rate' });
  }
});

// Locations
router.get('/locations', async (req, res) => {
  try {
    const locations = await storage.getAllLocations();
    res.json(locations);
  } catch (error) {
    console.error('Error getting locations:', error);
    res.status(500).json({ error: 'Failed to get locations' });
  }
});

router.get('/locations/warehouses', async (req, res) => {
  try {
    const warehouses = await storage.getWarehouseLocations();
    res.json(warehouses);
  } catch (error) {
    console.error('Error getting warehouse locations:', error);
    res.status(500).json({ error: 'Failed to get warehouse locations' });
  }
});

router.get('/locations/:id', async (req, res) => {
  try {
    const locationId = parseInt(req.params.id);
    const location = await storage.getLocationById(locationId);
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(location);
  } catch (error) {
    console.error('Error getting location:', error);
    res.status(500).json({ error: 'Failed to get location' });
  }
});

router.post('/locations', async (req, res) => {
  try {
    const locationData = insertLocationSchema.parse(req.body);
    const newLocation = await storage.createLocation(locationData);
    res.status(201).json(newLocation);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(400).json({ error: 'Failed to create location', details: error.toString() });
  }
});

router.put('/locations/:id', async (req, res) => {
  try {
    const locationId = parseInt(req.params.id);
    const locationData = insertLocationSchema.partial().parse(req.body);
    
    const updatedLocation = await storage.updateLocation(locationId, locationData);
    
    if (!updatedLocation) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(updatedLocation);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(400).json({ error: 'Failed to update location', details: error.toString() });
  }
});

router.delete('/locations/:id', async (req, res) => {
  try {
    const locationId = parseInt(req.params.id);
    const success = await storage.deleteLocation(locationId);
    
    if (!success) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

// Shipping cost calculation
router.post('/calculate-shipping', async (req, res) => {
  try {
    const { fromLocationId, toLocationId, weight } = req.body;
    
    if (!fromLocationId || !toLocationId) {
      return res.status(400).json({ error: 'From and to location IDs are required' });
    }
    
    const shippingCost = await storage.calculateShippingCost(
      parseInt(fromLocationId), 
      parseInt(toLocationId), 
      weight ? parseInt(weight) : undefined
    );
    
    res.json({ cost: shippingCost });
  } catch (error) {
    console.error('Error calculating shipping cost:', error);
    res.status(500).json({ error: 'Failed to calculate shipping cost', details: error.toString() });
  }
});

export default router;