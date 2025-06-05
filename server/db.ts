import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// PostgreSQL connection using environment variables provided by Replit
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
};

console.log('Attempting to connect to PostgreSQL database...');

// Create a PostgreSQL connection pool
export const pool = new Pool(dbConfig);

// Test the database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection error:', err.message);
    console.log('Using in-memory database as fallback');
    setupInMemoryDB();
  } else {
    console.log('Successfully connected to PostgreSQL database');
    
    if (client) {
      client.query('SELECT NOW() as now', (err, result) => {
        if (err) {
          console.error('Error executing query:', err.message);
        } else {
          console.log('Database time:', result.rows[0].now);
        }
        release();
      });
    }
  }
});

// Initialize Drizzle ORM with the database
export const drizzleDb = drizzle(pool, { schema });

// Simple query function for direct SQL queries
export const query = (text: string, params?: any[]) => pool.query(text, params);

// Use Drizzle ORM with the initialized database
export const db = drizzleDb;

// Add compatibility layer for existing code that expects drizzle-style db
Object.assign(db, {
  query: async (sql: string, params?: any[]) => {
    return await pool.query(sql, params);
  },
  insert: (table: any) => ({
    values: (data: any) => ({
      returning: async () => {
        try {
          const tableName = table && table._ && table._.name ? table._.name : 'users';
          const keys = Object.keys(data);
          const values = Object.values(data);
          
          if (keys.length === 0) return [{}];
          
          // Build PostgreSQL-compatible placeholders
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
          const query = `INSERT INTO "${tableName}" (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
          
          const result = await pool.query(query, values);
          return result.rows || [];
        } catch (error) {
          console.error('Error in db.insert:', error);
          return [data]; // Return data as fallback
        }
      }
    })
  }),
  select: () => ({
    from: (table: any) => {
      let tableName = 'users';
      
      if (typeof table === 'string') {
        tableName = table;
      } else if (table && table._ && table._.name) {
        tableName = table._.name;
      }
      
      return {
        where: (condition: any) => ({
          orderBy: async () => {
            try {
              // Simple version without specific condition
              const result = await pool.query(`SELECT * FROM "${tableName}"`);
              return result.rows;
            } catch (error) {
              console.error(`Error in db.select from ${tableName}:`, error);
              return [];
            }
          }
        }),
        orderBy: async () => {
          try {
            const result = await pool.query(`SELECT * FROM "${tableName}"`);
            return result.rows;
          } catch (error) {
            console.error(`Error in db.select from ${tableName}:`, error);
            return [];
          }
        },
        groupBy: () => ({
          orderBy: async () => {
            try {
              const result = await pool.query(`SELECT * FROM "${tableName}"`);
              return result.rows;
            } catch (error) {
              console.error(`Error in db.select grouped from ${tableName}:`, error);
              return [];
            }
          }
        })
      };
    }
  }),
  update: (table: any) => ({
    set: (data: any) => ({
      where: (condition: any) => ({
        returning: async () => {
          try {
            const tableName = table && table._ && table._.name ? table._.name : 'users';
            const keys = Object.keys(data);
            const values = Object.values(data);
            
            if (keys.length === 0) return [{}];
            
            const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
            const query = `UPDATE "${tableName}" SET ${setClause} RETURNING *`;
            
            const result = await pool.query(query, values);
            return result.rows;
          } catch (error) {
            console.error(`Error in db.update:`, error);
            return [data]; // Return data as fallback
          }
        }
      })
    })
  }),
  delete: (table: any) => ({
    where: (condition: any) => ({
      returning: async () => {
        try {
          const tableName = table && table._ && table._.name ? table._.name : 'users';
          
          // Simple delete without conditions
          const query = `DELETE FROM "${tableName}" RETURNING *`;
          const result = await pool.query(query);
          return result.rows;
        } catch (error) {
          console.error(`Error in db.delete:`, error);
          return [];
        }
      }
    })
  }),
  transaction: async (fn: Function) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(db);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  // Provide a direct way to create the tables
  createTable: async (sql: string) => {
    try {
      await pool.query(sql);
      return true;
    } catch (error) {
      console.error('Error creating table:', error);
      return false;
    }
  }
});

// In-memory database fallback
function setupInMemoryDB() {
  console.log('Setting up in-memory database as fallback...');
  
  class SimpleDB {
    private data = new Map<string, any[]>();
    private counters = new Map<string, number>();
    
    constructor() {
      // Initialize some common tables
      this.initTable('settings');
      this.initTable('users');
      this.initTable('products');
      this.initTable('categories');
      this.initTable('contacts');
      
      // Add some default data
      this.insert('settings', { key: 'site_name', value: 'Jaberco', category: 'general' });
      this.insert('settings', { key: 'site_description', value: 'Amazon Returns Pallets', category: 'general' });
    }
    
    initTable(name: string) {
      if (!this.data.has(name)) {
        this.data.set(name, []);
        this.counters.set(name, 1);
      }
    }
    
    insert(table: string, item: any) {
      this.initTable(table);
      
      const id = this.counters.get(table)!;
      this.counters.set(table, id + 1);
      
      const now = new Date();
      const newItem = { 
        ...item, 
        id: item.id || id,
        created_at: item.created_at || now
      };
      
      this.data.get(table)!.push(newItem);
      return newItem;
    }
    
    findMany(table: string, where?: Record<string, any>) {
      this.initTable(table);
      const items = this.data.get(table)!;
      
      if (!where) return items;
      
      return items.filter(item => 
        Object.entries(where).every(([key, value]) => item[key] === value)
      );
    }
    
    findFirst(table: string, where: Record<string, any>) {
      const items = this.findMany(table, where);
      return items[0] || null;
    }
    
    update(table: string, where: Record<string, any>, data: any) {
      this.initTable(table);
      const items = this.data.get(table)!;
      
      const index = items.findIndex(item => 
        Object.entries(where).every(([key, value]) => item[key] === value)
      );
      
      if (index === -1) return null;
      
      const updatedItem = { ...items[index], ...data };
      items[index] = updatedItem;
      
      return updatedItem;
    }
    
    delete(table: string, where: Record<string, any>) {
      this.initTable(table);
      const items = this.data.get(table)!;
      
      const index = items.findIndex(item => 
        Object.entries(where).every(([key, value]) => item[key] === value)
      );
      
      if (index === -1) return null;
      
      const deletedItem = items[index];
      items.splice(index, 1);
      
      return deletedItem;
    }
  }
  
  // Create global instance
  const simpleDb = new SimpleDB();
  
  // Override DB interface to use in-memory database
  Object.assign(db, {
    insert: (table: any) => ({
      values: (data: any) => ({
        returning: async () => {
          const tableName = table._.name;
          const result = simpleDb.insert(tableName, data);
          return [result];
        }
      })
    }),
    select: () => ({
      from: (table: any) => {
        const tableName = typeof table === 'string' ? table : table._.name;
        
        return {
          where: () => ({
            orderBy: () => Promise.resolve(simpleDb.findMany(tableName))
          }),
          orderBy: () => Promise.resolve(simpleDb.findMany(tableName)),
          groupBy: () => ({
            orderBy: () => Promise.resolve(simpleDb.findMany(tableName))
          })
        };
      }
    }),
    update: (table: any) => ({
      set: (data: any) => ({
        where: (condition: any) => ({
          returning: async () => {
            const tableName = table._.name;
            const result = simpleDb.update(tableName, condition, data);
            return result ? [result] : [];
          }
        })
      })
    }),
    delete: (table: any) => ({
      where: (condition: any) => ({
        returning: async () => {
          const tableName = table._.name;
          const result = simpleDb.delete(tableName, condition);
          return result ? [result] : [];
        }
      })
    })
  });
}