import { db } from './server/db.js';

async function directMigration() {
  console.log('بدء نقل البيانات باستخدام الطريقة المباشرة...');
  
  // Export data from current database
  const exportQueries = [
    'SELECT * FROM users',
    'SELECT * FROM products', 
    'SELECT * FROM product_images',
    'SELECT * FROM settings',
    'SELECT * FROM orders',
    'SELECT * FROM order_items',
    'SELECT * FROM contacts',
    'SELECT * FROM appointments',
    'SELECT * FROM notifications',
    'SELECT * FROM faqs'
  ];
  
  const exportData = {};
  
  for (const query of exportQueries) {
    try {
      const tableName = query.split('FROM ')[1].trim();
      console.log(`تصدير جدول: ${tableName}`);
      const result = await db.execute(query);
      exportData[tableName] = result;
      console.log(`تم تصدير ${result.length} صف من ${tableName}`);
    } catch (error) {
      console.log(`خطأ في تصدير ${query}:`, error.message);
    }
  }
  
  // Create JSON export
  const exportJson = JSON.stringify(exportData, null, 2);
  console.log('\nتم إنشاء ملف JSON للتصدير');
  
  return exportData;
}

directMigration().then(data => {
  console.log('البيانات المصدرة:', Object.keys(data));
}).catch(console.error);