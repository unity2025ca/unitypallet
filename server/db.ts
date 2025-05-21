import { Pool } from 'pg';
import * as schema from "@shared/schema";

// PostgreSQL connection configuration
const dbConfig = {
  host: '11.118.0.44',
  port: 5432,
  database: 'jabex_jaber',
  user: 'jabex_jaberco',
  password: 'r@RZHD5]cTqz',
  ssl: false
};

// Create a connection pool
export const pool = new Pool(dbConfig);

// Test the database connection
console.log('Attempting to connect to PostgreSQL database...');
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Successfully connected to PostgreSQL database');
    client.query('SELECT NOW()', (err, result) => {
      if (err) {
        console.error('Error executing query:', err.message);
      } else {
        console.log('Database time:', result.rows[0]);
      }
      release();
    });
  }
});

// Create a simple query function to work with the database
export const query = (text: string, params?: any[]) => pool.query(text, params);

// Create a simple database interface to replace Drizzle ORM temporarily
export const db = {
  insert: async (table: string, data: Record<string, any>) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    const queryText = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(queryText, values);
    return result.rows[0];
  },
  
  select: async (table: string, where?: Record<string, any>) => {
    let queryText = `SELECT * FROM ${table}`;
    const values: any[] = [];
    
    if (where && Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map((key, i) => {
        values.push(where[key]);
        return `${key} = $${i + 1}`;
      }).join(' AND ');
      
      queryText += ` WHERE ${conditions}`;
    }
    
    const result = await pool.query(queryText, values);
    return result.rows;
  },
  
  update: async (table: string, data: Record<string, any>, where: Record<string, any>) => {
    const setKeys = Object.keys(data);
    const setValues = Object.values(data);
    
    const setClause = setKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);
    
    const whereClause = whereKeys.map((key, i) => `${key} = $${setKeys.length + i + 1}`).join(' AND ');
    
    const queryText = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
    const values = [...setValues, ...whereValues];
    
    const result = await pool.query(queryText, values);
    return result.rows[0];
  },
  
  delete: async (table: string, where: Record<string, any>) => {
    const keys = Object.keys(where);
    const values = Object.values(where);
    
    const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
    
    const queryText = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`;
    
    const result = await pool.query(queryText, values);
    return result.rows[0];
  },
  
  query,
  pool
};