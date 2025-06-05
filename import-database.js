import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'fs';

// Configure WebSocket for Neon
const neonConfig = { webSocketConstructor: ws };

// Function to import data to new database
async function importToNewDatabase(newDatabaseUrl) {
  console.log('بدء استيراد البيانات إلى قاعدة البيانات الجديدة...');
  
  const newDb = new Pool({ 
    connectionString: newDatabaseUrl,
    ...neonConfig
  });
  
  try {
    // Read SQL file
    const sqlData = fs.readFileSync('jaberco_database_export_manual.sql', 'utf8');
    
    // Split by SQL statements (basic splitting by semicolon and newline)
    const statements = sqlData.split(';\n').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}`);
          await newDb.query(statement);
        } catch (error) {
          console.log(`خطأ في تنفيذ العبارة ${i + 1}:`, error.message);
        }
      }
    }
    
    console.log('\n✅ تم استيراد البيانات بنجاح!');
    
    // Verify import
    const userCount = await newDb.query('SELECT COUNT(*) as count FROM users');
    const productCount = await newDb.query('SELECT COUNT(*) as count FROM products');
    const settingsCount = await newDb.query('SELECT COUNT(*) as count FROM settings');
    
    console.log('\nتحقق من البيانات المستوردة:');
    console.log(`- المستخدمين: ${userCount.rows[0].count}`);
    console.log(`- المنتجات: ${productCount.rows[0].count}`);
    console.log(`- الإعدادات: ${settingsCount.rows[0].count}`);
    
  } catch (error) {
    console.error('خطأ في الاستيراد:', error.message);
  } finally {
    await newDb.end();
  }
}

// Usage example
if (process.argv[2]) {
  importToNewDatabase(process.argv[2]);
} else {
  console.log('الاستخدام: node import-database.js "postgresql://username:password@host:port/database"');
}

export { importToNewDatabase };