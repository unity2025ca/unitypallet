#!/usr/bin/env node

/**
 * سكريبت تشغيل نقل البيانات
 * Run Database Migration Script
 */

import { migrateDatabase } from './migrate-database.js';

console.log('🚀 بدء تشغيل سكريبت نقل البيانات');
console.log('=====================================');

// فحص متغيرات البيئة المطلوبة
if (!process.env.DATABASE_URL && !process.env.OLD_DATABASE_URL) {
  console.error('❌ خطأ: يجب تعيين متغير DATABASE_URL أو OLD_DATABASE_URL');
  console.log('مثال:');
  console.log('export DATABASE_URL="postgresql://username:password@host:port/database"');
  console.log('أو');
  console.log('export OLD_DATABASE_URL="postgresql://username:password@host:port/old_database"');
  process.exit(1);
}

// عرض معلومات الاتصال
const dbUrl = process.env.OLD_DATABASE_URL || process.env.DATABASE_URL;
const urlParts = new URL(dbUrl);
console.log(`🔗 الاتصال بقاعدة البيانات: ${urlParts.hostname}:${urlParts.port}${urlParts.pathname}`);

try {
  await migrateDatabase();
  console.log('\n✅ تمت عملية النقل بنجاح!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ فشلت عملية النقل:', error.message);
  process.exit(1);
}