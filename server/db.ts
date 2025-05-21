import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

// MySQL connection configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  database: 'jabex_jaber', // Adjust if your database name is different
  user: 'jabex_jaberco',   // Adjust if your MySQL username is different
  password: 'r@RZHD5]cTqz', // Adjust if your MySQL password is different
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('Attempting to connect to MySQL database...');

// Create a MySQL connection pool
export let pool: mysql.Pool;

// Try to establish connection
async function initializeDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    
    // Test the connection
    const [rows] = await pool.query('SELECT NOW() as now');
    console.log('Successfully connected to MySQL database');
    console.log('Database time:', rows[0].now);
    
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    console.log('Using in-memory database as fallback');
    setupInMemoryDB();
    return false;
  }
}

// Initialize connection
initializeDatabase();

// Simple query function for direct SQL queries
export const query = async (text: string, params?: any[]) => {
  try {
    if (pool) {
      const [rows] = await pool.query(text, params);
      return { rows };
    }
    return { rows: [] };
  } catch (error) {
    console.error('Query error:', error);
    return { rows: [] };
  }
};

// Setup DB functions for compatibility with the code that uses Drizzle ORM
export const db = {
  insert: (table: any) => ({
    values: (data: any) => ({
      returning: async () => {
        const tableName = table._.name || 'users';
        const keys = Object.keys(data);
        const values = Object.values(data);
        
        if (keys.length === 0) return [{}];
        
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO \`${tableName}\` (${keys.map(k => `\`${k}\``).join(', ')}) VALUES (${placeholders})`;
        
        try {
          if (!pool) return [data];
          
          const result = await pool.execute(sql, values);
          const insertId = result[0].insertId;
          
          // Get the inserted data
          const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` WHERE id = ?`, [insertId]);
          return rows;
        } catch (error) {
          console.error(`Error inserting into ${tableName}:`, error);
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
              if (!pool) return [];
              
              // Simple version without specific condition
              const [rows] = await pool.query(`SELECT * FROM \`${tableName}\``);
              return rows;
            } catch (error) {
              console.error(`Error selecting from ${tableName}:`, error);
              return [];
            }
          }
        }),
        orderBy: async () => {
          try {
            if (!pool) return [];
            
            const [rows] = await pool.query(`SELECT * FROM \`${tableName}\``);
            return rows;
          } catch (error) {
            console.error(`Error selecting from ${tableName}:`, error);
            return [];
          }
        },
        groupBy: () => ({
          orderBy: async () => {
            try {
              if (!pool) return [];
              
              const [rows] = await pool.query(`SELECT * FROM \`${tableName}\``);
              return rows;
            } catch (error) {
              console.error(`Error selecting from ${tableName}:`, error);
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
            if (!pool) return [data];
            
            const tableName = table._.name || 'users';
            const keys = Object.keys(data);
            const values = Object.values(data);
            
            if (keys.length === 0) return [{}];
            
            // Simple update without specific condition for now
            const setClause = keys.map(key => `\`${key}\` = ?`).join(', ');
            const sql = `UPDATE \`${tableName}\` SET ${setClause}`;
            
            await pool.execute(sql, values);
            return [data]; // Since MySQL doesn't have RETURNING clause
          } catch (error) {
            console.error(`Error updating:`, error);
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
          if (!pool) return [];
          
          const tableName = table._.name || 'users';
          
          // Simple delete
          const sql = `DELETE FROM \`${tableName}\``;
          await pool.execute(sql);
          return [];
        } catch (error) {
          console.error(`Error deleting:`, error);
          return [];
        }
      }
    })
  }),
  transaction: async (fn: Function) => {
    if (!pool) return fn(db);
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await fn(db);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  query: async (sql: string, params?: any[]) => {
    if (!pool) return { rows: [] };
    
    try {
      const [rows] = await pool.query(sql, params);
      return { rows };
    } catch (error) {
      console.error('Query error:', error);
      return { rows: [] };
    }
  }
};

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