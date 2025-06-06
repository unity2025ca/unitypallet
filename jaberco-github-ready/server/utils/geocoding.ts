import fetch from 'node-fetch';

interface Coordinates {
  lat: number;
  lng: number;
}

// Function to get coordinates from an address using a free geocoding API
export async function getAddressCoordinates(address: string): Promise<Coordinates | null> {
  try {
    // Use OpenStreetMap (Nominatim) geocoding API - it's free but has rate limits
    // Make sure to respect their usage policy: https://operations.osmfoundation.org/policies/nominatim/
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'Unity-Pallets-Ecommerce/1.0' // Set a user agent as required by Nominatim
        }
      }
    );
    
    if (!response.ok) {
      console.error(`Geocoding API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error('No geocoding results found for address:', address);
      return null;
    }
    
    const result = data[0];
    
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };
  } catch (error) {
    console.error('Error during geocoding:', error);
    return null;
  }
}