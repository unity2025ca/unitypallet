import * as schema from "@shared/schema";

// Create a simple database wrapper with basic CRUD operations
// This is a temporary solution until we properly set up your cPanel database
class SimpleDB {
  private data = new Map<string, any[]>();
  private counters = new Map<string, number>();

  async insert(table: string, item: any) {
    // Initialize table if it doesn't exist
    if (!this.data.has(table)) {
      this.data.set(table, []);
      this.counters.set(table, 1);
    }

    // Create a new item with ID
    const id = this.counters.get(table) || 1;
    this.counters.set(table, id + 1);
    
    const newItem = { ...item, id };
    this.data.get(table)?.push(newItem);
    
    console.log(`[SimpleDB] Inserted into ${table}:`, newItem);
    return newItem;
  }

  async findMany(table: string, where?: Record<string, any>) {
    const items = this.data.get(table) || [];
    
    if (!where) {
      return items;
    }
    
    return items.filter(item => {
      return Object.entries(where).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }

  async findFirst(table: string, where: Record<string, any>) {
    const items = await this.findMany(table, where);
    return items[0] || null;
  }

  async update(table: string, where: Record<string, any>, data: any) {
    const tableData = this.data.get(table) || [];
    
    // Find the item to update
    const index = tableData.findIndex(item => {
      return Object.entries(where).every(([key, value]) => {
        return item[key] === value;
      });
    });
    
    if (index === -1) {
      return null;
    }
    
    // Update the item
    const updatedItem = { ...tableData[index], ...data };
    tableData[index] = updatedItem;
    
    return updatedItem;
  }
  
  async delete(table: string, where: Record<string, any>) {
    const tableData = this.data.get(table) || [];
    
    // Find the item to delete
    const index = tableData.findIndex(item => {
      return Object.entries(where).every(([key, value]) => {
        return item[key] === value;
      });
    });
    
    if (index === -1) {
      return null;
    }
    
    // Delete the item
    const deletedItem = tableData[index];
    tableData.splice(index, 1);
    
    return deletedItem;
  }
}

// Create a dummy version of drizzle's db interface
export const db = {
  insert: (table: any) => ({
    values: (data: any) => ({
      returning: async () => {
        const tableName = table._.name;
        const result = await simpleDb.insert(tableName, data);
        return [result];
      }
    })
  }),
  select: () => ({
    from: () => ({
      where: () => ({
        orderBy: () => Promise.resolve([])
      }),
      orderBy: () => Promise.resolve([]),
      groupBy: () => ({
        orderBy: () => Promise.resolve([])
      })
    })
  }),
  update: () => ({
    set: () => ({
      where: () => ({
        returning: () => Promise.resolve([])
      })
    })
  }),
  delete: () => ({
    where: () => ({
      returning: () => Promise.resolve([])
    })
  }),
  transaction: async (fn: Function) => await fn(db)
};

// Simple in-memory database
export const simpleDb = new SimpleDB();

// Create some default settings
setTimeout(() => {
  simpleDb.insert('settings', { key: 'site_name', value: 'Jaberco', category: 'general' });
  simpleDb.insert('settings', { key: 'site_description', value: 'Amazon Returns Pallets', category: 'general' });
}, 1000);

// Placeholder exports to maintain compatibility
export const pool = null;