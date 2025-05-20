import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from "../shared/schema";

// Check for required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

async function runMigration() {
  console.log('Starting database migration...');
  
  try {
    // Connect to the database
    const connectionString = process.env.DATABASE_URL;
    const sql = postgres(connectionString, { max: 1 });
    const db = drizzle(sql, { schema });
    
    // Run the migration
    console.log('Connected to database, running migrations...');
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

runMigration();