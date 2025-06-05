/**
 * تثبيت جميع البيانات المفقودة من قاعدة البيانات الخارجية
 * Install all missing data from external database
 */

import fs from 'fs';

// قراءة البيانات الكاملة من الملف الأصلي
const completeExportData = JSON.parse(fs.readFileSync('./exported_data/complete_database_export.json', 'utf8'));

console.log('تحليل البيانات المفقودة...');
console.log('Analyzing missing data...');

// إحصائيات البيانات الكاملة
const fullStats = {};
Object.keys(completeExportData).forEach(table => {
  if (Array.isArray(completeExportData[table])) {
    fullStats[table] = completeExportData[table].length;
  }
});

console.log('\nإحصائيات البيانات الكاملة من قاعدة البيانات الخارجية:');
console.log('Complete data statistics from external database:');
Object.keys(fullStats).forEach(table => {
  console.log(`${table}: ${fullStats[table]} سجل`);
});

const totalFullRecords = Object.values(fullStats).reduce((sum, count) => sum + count, 0);
console.log(`\nإجمالي السجلات الكاملة: ${totalFullRecords}`);
console.log(`Total complete records: ${totalFullRecords}`);

// قراءة البيانات الحالية في النظام
let currentStorageData = {};
try {
  const currentData = JSON.parse(fs.readFileSync('./server/complete-imported-data.json', 'utf8'));
  currentStorageData = currentData.data || {};
} catch (error) {
  console.log('ملف البيانات الحالية غير موجود، سيتم إنشاؤه');
}

// إحصائيات البيانات الحالية
const currentStats = {};
Object.keys(currentStorageData).forEach(table => {
  if (Array.isArray(currentStorageData[table])) {
    currentStats[table] = currentStorageData[table].length;
  }
});

console.log('\nإحصائيات البيانات الحالية في النظام:');
console.log('Current data statistics in system:');
Object.keys(currentStats).forEach(table => {
  console.log(`${table}: ${currentStats[table] || 0} سجل`);
});

const totalCurrentRecords = Object.values(currentStats).reduce((sum, count) => sum + count, 0);
console.log(`\nإجمالي السجلات الحالية: ${totalCurrentRecords}`);
console.log(`Total current records: ${totalCurrentRecords}`);

// حساب البيانات المفقودة
console.log('\nالبيانات المفقودة:');
console.log('Missing data:');
Object.keys(fullStats).forEach(table => {
  const missing = fullStats[table] - (currentStats[table] || 0);
  if (missing > 0) {
    console.log(`${table}: ${missing} سجل مفقود`);
  }
});

// إنشاء ملف البيانات المكتملة
const completeDataForSystem = {
  summary: {
    totalTables: Object.keys(fullStats).length,
    totalRecords: totalFullRecords,
    importDate: new Date().toISOString(),
    dataSource: 'Complete External PostgreSQL Database Export'
  },
  data: completeExportData
};

// حفظ البيانات الكاملة
fs.writeFileSync('./server/complete-external-data.json', JSON.stringify(completeDataForSystem, null, 2));

console.log('\nتم إنشاء ملف البيانات الخارجية الكاملة: server/complete-external-data.json');
console.log('Complete external data file created: server/complete-external-data.json');

console.log('\nيجب الآن تحديث storage-simple.ts لتحميل هذه البيانات الكاملة');
console.log('storage-simple.ts must now be updated to load this complete data');