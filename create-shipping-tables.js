import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';
import ws from 'ws';

// Setup Neon with WebSockets
neonConfig.webSocketConstructor = ws;

// Initialize dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: path.resolve(__dirname, '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function createTables() {
  try {
    console.log('Creating shipping tables...');

    // Create shipping_zones table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shipping_zones (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created shipping_zones table');

    // Create shipping_rates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shipping_rates (
        id SERIAL PRIMARY KEY,
        zone_id INTEGER NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
        min_distance INTEGER NOT NULL,
        max_distance INTEGER NOT NULL,
        base_rate INTEGER NOT NULL,
        additional_rate_per_km INTEGER NOT NULL,
        min_weight INTEGER,
        max_weight INTEGER,
        additional_rate_per_kg INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created shipping_rates table');

    // Create locations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        city TEXT NOT NULL,
        province TEXT NOT NULL,
        country TEXT NOT NULL DEFAULT 'Canada',
        postal_code TEXT,
        latitude TEXT NOT NULL,
        longitude TEXT NOT NULL,
        is_warehouse BOOLEAN DEFAULT FALSE,
        zone_id INTEGER REFERENCES shipping_zones(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created locations table');
    
    console.log('All shipping tables created successfully');
    
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createTables().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});