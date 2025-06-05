import { Pool } from '@neondatabase/serverless';
import fs from 'fs';

// اتصال بقاعدة البيانات الحالية
const currentDb = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// قائمة الجداول للتصدير
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

async function exportData() {
  console.log('بدء تصدير البيانات...');
  
  const exportData = {};
  
  for (const table of tables) {
    try {
      console.log(`تصدير جدول: ${table}`);
      const result = await currentDb.query(`SELECT * FROM ${table}`);
      exportData[table] = result.rows;
      console.log(`تم تصدير ${result.rows.length} صف من جدول ${table}`);
    } catch (error) {
      console.log(`خطأ في تصدير جدول ${table}:`, error.message);
      exportData[table] = [];
    }
  }
  
  // حفظ البيانات في ملف JSON
  const exportFileName = `jaberco_database_export_${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(exportFileName, JSON.stringify(exportData, null, 2));
  
  console.log(`\n✅ تم تصدير البيانات بنجاح إلى: ${exportFileName}`);
  console.log('\nملخص البيانات المصدرة:');
  
  for (const [table, data] of Object.entries(exportData)) {
    console.log(`- ${table}: ${data.length} صف`);
  }
  
  return exportFileName;
}

exportData().catch(console.error);