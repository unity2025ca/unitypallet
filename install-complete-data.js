/**
 * تثبيت جميع البيانات المستوردة في النظام الداخلي
 * Install all imported data into internal system
 */

import fs from 'fs';
import path from 'path';

// قراءة البيانات المصدرة
const exportData = JSON.parse(fs.readFileSync('./exported_data/complete_database_export.json', 'utf8'));

console.log('بدء تثبيت جميع البيانات المستوردة...');
console.log('Starting installation of all imported data...');

// إحصائيات البيانات المستوردة
console.log('\nإحصائيات البيانات المستوردة:');
console.log('Imported data statistics:');

const tables = [
  'users', 'products', 'contacts', 'settings', 'categories', 
  'appointments', 'orders', 'cart_items', 'carts', 'subscribers', 
  'faqs', 'notifications', 'order_items', 'shipping_zones', 
  'shipping_rates', 'locations', 'allowed_cities', 'visitor_stats', 
  'product_images'
];

tables.forEach(table => {
  const count = exportData[table] ? exportData[table].length : 0;
  console.log(`${table}: ${count} سجل`);
});

// إجمالي السجلات
const totalRecords = tables.reduce((sum, table) => {
  return sum + (exportData[table] ? exportData[table].length : 0);
}, 0);

console.log(`\nإجمالي السجلات: ${totalRecords}`);
console.log(`Total records: ${totalRecords}`);

// إنشاء ملف البيانات المكتملة للتثبيت
const completeDataForInstallation = {
  summary: {
    totalTables: tables.length,
    totalRecords: totalRecords,
    exportDate: new Date().toISOString(),
    dataSource: 'External PostgreSQL Database'
  },
  data: exportData
};

// حفظ ملف البيانات للتثبيت
fs.writeFileSync('./server/complete-imported-data.json', JSON.stringify(completeDataForInstallation, null, 2));

console.log('\nتم إنشاء ملف البيانات المكتملة للتثبيت: server/complete-imported-data.json');
console.log('Complete data file created for installation: server/complete-imported-data.json');

console.log('\nيجب تحديث storage-simple.ts لتحميل جميع هذه البيانات');
console.log('storage-simple.ts needs to be updated to load all this data');