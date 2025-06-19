import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Override with working database URL - temporary fix for quota exceeded issue
const workingDatabaseUrl = "postgresql://neondb_owner:npg_N1fS2iczBMLb@ep-snowy-hill-a5gjongk.us-east-2.aws.neon.tech:5432/neondb?sslmode=require";

if (!process.env.DATABASE_URL && !workingDatabaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: workingDatabaseUrl || process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });