import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for Neon
const neonConfig = { webSocketConstructor: ws };

const currentDb = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ...neonConfig
});

const newDb = new Pool({ 
  connectionString: process.env.NEW_DATABASE_URL,
  ...neonConfig
});

const tables = [
  'users',
  'products', 
  'product_images',
  'settings',
  'categories',
  'orders',
  'order_items',
  'carts',
  'cart_items',
  'contacts',
  'appointments',
  'notifications',
  'faqs',
  'subscribers',
  'allowed_cities',
  'shipping_zones',
  'shipping_rates',
  'locations',
  'visitor_stats'
];

async function migrateData() {
  console.log('بدء نقل البيانات من قاعدة البيانات الحالية إلى الجديدة...');
  
  let totalMigrated = 0;
  
  for (const table of tables) {
    try {
      console.log(`\nنقل جدول: ${table}`);
      
      // Get data from current database
      const result = await currentDb.query(`SELECT * FROM ${table}`);
      const rows = result.rows;
      
      if (rows.length === 0) {
        console.log(`- الجدول ${table} فارغ`);
        continue;
      }
      
      console.log(`- تم العثور على ${rows.length} صف`);
      
      // Get column names
      const columns = Object.keys(rows[0]);
      const columnNames = columns.join(', ');
      
      // Create insert statements
      for (const row of rows) {
        const values = columns.map(col => {
          const value = row[col];
          if (value === null) return 'NULL';
          if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
          if (typeof value === 'boolean') return value ? 'true' : 'false';
          if (value instanceof Date) return `'${value.toISOString()}'`;
          return value;
        }).join(', ');
        
        const insertQuery = `INSERT INTO ${table} (${columnNames}) VALUES (${values}) ON CONFLICT DO NOTHING`;
        
        try {
          await newDb.query(insertQuery);
        } catch (error) {
          console.log(`خطأ في إدراج صف في ${table}:`, error.message);
        }
      }
      
      console.log(`✅ تم نقل ${rows.length} صف من جدول ${table}`);
      totalMigrated += rows.length;
      
    } catch (error) {
      console.log(`❌ خطأ في نقل جدول ${table}:`, error.message);
    }
  }
  
  console.log(`\n🎉 تم نقل ${totalMigrated} صف إجمالي`);
  
  // Verify migration
  console.log('\nالتحقق من النقل:');
  try {
    const userCount = await newDb.query('SELECT COUNT(*) as count FROM users');
    const productCount = await newDb.query('SELECT COUNT(*) as count FROM products');
    const settingsCount = await newDb.query('SELECT COUNT(*) as count FROM settings');
    
    console.log(`- المستخدمين: ${userCount.rows[0].count}`);
    console.log(`- المنتجات: ${productCount.rows[0].count}`);
    console.log(`- الإعدادات: ${settingsCount.rows[0].count}`);
  } catch (error) {
    console.log('خطأ في التحقق:', error.message);
  }
}

migrateData()
  .then(() => {
    console.log('\n✅ اكتملت عملية النقل بنجاح!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ فشل في النقل:', error);
    process.exit(1);
  });