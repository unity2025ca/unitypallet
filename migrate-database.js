#!/usr/bin/env node

/**
 * سكريبت نقل شامل لجميع البيانات والجداول من قاعدة البيانات القديمة
 * Database Migration Script - Complete Data Transfer
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import fs from 'fs/promises';
import path from 'path';
import ws from 'ws';

// تكوين WebSocket لـ Neon
neonConfig.webSocketConstructor = ws;

// إعداد الاتصال بقاعدة البيانات القديمة
const oldDatabaseUrl = process.env.OLD_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString: oldDatabaseUrl });

// تعريف هيكل الجداول المطلوبة
const tableStructures = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      full_name VARCHAR(255),
      phone VARCHAR(20),
      is_admin BOOLEAN DEFAULT false,
      role_type VARCHAR(50) DEFAULT 'customer',
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  products: `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      title_ar VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      description_ar TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      image_url TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'available',
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  categories: `
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      name_ar VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      description_ar TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  product_images: `
    CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      is_main BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  settings: `
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(255) UNIQUE NOT NULL,
      value TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'text',
      description TEXT,
      category VARCHAR(100) DEFAULT 'general',
      label VARCHAR(255) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  contacts: `
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      message TEXT,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  faqs: `
    CREATE TABLE IF NOT EXISTS faqs (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  appointments: `
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      date DATE NOT NULL,
      time TIME NOT NULL,
      message TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  subscribers: `
    CREATE TABLE IF NOT EXISTS subscribers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  visitor_stats: `
    CREATE TABLE IF NOT EXISTS visitor_stats (
      id SERIAL PRIMARY KEY,
      visitor_ip VARCHAR(45) NOT NULL,
      page_url VARCHAR(500) NOT NULL,
      user_agent TEXT,
      referrer VARCHAR(500),
      country_code VARCHAR(2),
      device_type VARCHAR(20),
      visit_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  notifications: `
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) NOT NULL,
      is_read BOOLEAN DEFAULT false,
      related_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  orders: `
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(20),
      shipping_address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      province VARCHAR(100) NOT NULL,
      postal_code VARCHAR(10) NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      shipping_cost DECIMAL(10,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'pending',
      payment_status VARCHAR(20) DEFAULT 'pending',
      stripe_payment_intent_id VARCHAR(255),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  order_items: `
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      price_per_unit DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  shipping_zones: `
    CREATE TABLE IF NOT EXISTS shipping_zones (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      max_distance_limit INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  shipping_rates: `
    CREATE TABLE IF NOT EXISTS shipping_rates (
      id SERIAL PRIMARY KEY,
      zone_id INTEGER REFERENCES shipping_zones(id) ON DELETE CASCADE,
      min_distance INTEGER NOT NULL,
      max_distance INTEGER NOT NULL,
      base_rate DECIMAL(10,2) NOT NULL,
      additional_rate_per_km DECIMAL(10,2) DEFAULT 0,
      min_weight INTEGER,
      max_weight INTEGER,
      additional_rate_per_kg DECIMAL(10,2) DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  locations: `
    CREATE TABLE IF NOT EXISTS locations (
      id SERIAL PRIMARY KEY,
      city VARCHAR(255) NOT NULL,
      province VARCHAR(255) NOT NULL,
      postal_code VARCHAR(10),
      country VARCHAR(100) DEFAULT 'Canada',
      latitude VARCHAR(20) NOT NULL,
      longitude VARCHAR(20) NOT NULL,
      zone_id INTEGER REFERENCES shipping_zones(id),
      is_warehouse BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  allowed_cities: `
    CREATE TABLE IF NOT EXISTS allowed_cities (
      id SERIAL PRIMARY KEY,
      province VARCHAR(255) NOT NULL,
      city_name VARCHAR(255) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  carts: `
    CREATE TABLE IF NOT EXISTS carts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      session_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id),
      UNIQUE(session_id)
    );
  `,
  
  cart_items: `
    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `
};

// دالة لفحص وجود الجداول
async function checkTablesExist() {
  console.log('🔍 فحص الجداول الموجودة في قاعدة البيانات...');
  
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    const existingTables = result.rows.map(row => row.table_name);
    console.log(`📊 الجداول الموجودة: ${existingTables.join(', ')}`);
    
    return existingTables;
  } catch (error) {
    console.error('❌ خطأ في فحص الجداول:', error);
    return [];
  } finally {
    client.release();
  }
}

// دالة لإنشاء الجداول المفقودة
async function createMissingTables(existingTables) {
  console.log('🏗️ إنشاء الجداول المفقودة...');
  
  const client = await pool.connect();
  try {
    for (const [tableName, createQuery] of Object.entries(tableStructures)) {
      if (!existingTables.includes(tableName)) {
        console.log(`📋 إنشاء جدول: ${tableName}`);
        await client.query(createQuery);
      } else {
        console.log(`✅ جدول ${tableName} موجود مسبقاً`);
      }
    }
  } catch (error) {
    console.error('❌ خطأ في إنشاء الجداول:', error);
  } finally {
    client.release();
  }
}

// دالة لاستخراج البيانات من الجداول
async function extractTableData(tableName) {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM ${tableName} ORDER BY id`);
    console.log(`📤 استخراج ${result.rows.length} سجل من جدول ${tableName}`);
    return result.rows;
  } catch (error) {
    console.log(`⚠️ لا يمكن استخراج البيانات من جدول ${tableName}: ${error.message}`);
    return [];
  } finally {
    client.release();
  }
}

// دالة لحفظ البيانات كملف JSON
async function saveDataToFiles(allData) {
  console.log('💾 حفظ البيانات في ملفات JSON...');
  
  const dataDir = './exported_data';
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // المجلد موجود مسبقاً
  }
  
  // حفظ البيانات الكاملة
  await fs.writeFile(
    path.join(dataDir, 'complete_database_export.json'),
    JSON.stringify(allData, null, 2),
    'utf8'
  );
  
  // حفظ كل جدول في ملف منفصل
  for (const [tableName, data] of Object.entries(allData)) {
    if (data.length > 0) {
      await fs.writeFile(
        path.join(dataDir, `${tableName}.json`),
        JSON.stringify(data, null, 2),
        'utf8'
      );
    }
  }
  
  console.log(`✅ تم حفظ البيانات في مجلد: ${dataDir}`);
}

// دالة لإنشاء سكريبت SQL لاستيراد البيانات
async function generateSQLScript(allData) {
  console.log('📝 إنشاء سكريبت SQL لاستيراد البيانات...');
  
  let sqlScript = `-- سكريبت استيراد البيانات المصدر من قاعدة البيانات القديمة
-- Generated on: ${new Date().toISOString()}

-- تعطيل فحص المفاتيح الخارجية مؤقتاً
SET foreign_key_checks = 0;

`;

  for (const [tableName, data] of Object.entries(allData)) {
    if (data.length > 0) {
      sqlScript += `\n-- بيانات جدول ${tableName}\n`;
      sqlScript += `TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE;\n`;
      
      const firstRow = data[0];
      const columns = Object.keys(firstRow).join(', ');
      
      for (const row of data) {
        const values = Object.values(row)
          .map(value => {
            if (value === null) return 'NULL';
            if (typeof value === 'string') {
              return `'${value.replace(/'/g, "''")}'`;
            }
            if (value instanceof Date) {
              return `'${value.toISOString()}'`;
            }
            return value;
          })
          .join(', ');
        
        sqlScript += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
      }
    }
  }

  sqlScript += `\n-- إعادة تفعيل فحص المفاتيح الخارجية
SET foreign_key_checks = 1;

-- تحديث تسلسل الـ ID للجداول
`;

  for (const tableName of Object.keys(allData)) {
    if (allData[tableName].length > 0) {
      sqlScript += `SELECT setval('${tableName}_id_seq', (SELECT MAX(id) FROM ${tableName}));\n`;
    }
  }

  await fs.writeFile('./exported_data/import_script.sql', sqlScript, 'utf8');
  console.log('✅ تم إنشاء سكريبت SQL: ./exported_data/import_script.sql');
}

// دالة لإنشاء تقرير التصدير
async function generateExportReport(allData, existingTables) {
  const report = {
    exportDate: new Date().toISOString(),
    totalTables: Object.keys(tableStructures).length,
    existingTables: existingTables.length,
    exportedTables: Object.keys(allData).filter(table => allData[table].length > 0).length,
    totalRecords: Object.values(allData).reduce((sum, tableData) => sum + tableData.length, 0),
    tableDetails: {}
  };

  for (const [tableName, data] of Object.entries(allData)) {
    report.tableDetails[tableName] = {
      recordCount: data.length,
      status: data.length > 0 ? 'exported' : 'empty'
    };
  }

  await fs.writeFile(
    './exported_data/export_report.json',
    JSON.stringify(report, null, 2),
    'utf8'
  );

  console.log('\n📊 تقرير التصدير:');
  console.log(`📅 تاريخ التصدير: ${report.exportDate}`);
  console.log(`📋 إجمالي الجداول: ${report.totalTables}`);
  console.log(`✅ الجداول الموجودة: ${report.existingTables}`);
  console.log(`📤 الجداول المصدرة: ${report.exportedTables}`);
  console.log(`📊 إجمالي السجلات: ${report.totalRecords}`);
}

// الدالة الرئيسية
async function main() {
  console.log('🚀 بدء عملية نقل البيانات من قاعدة البيانات القديمة');
  console.log('================================================');

  try {
    // فحص الجداول الموجودة
    const existingTables = await checkTablesExist();
    
    // إنشاء الجداول المفقودة
    await createMissingTables(existingTables);
    
    // استخراج البيانات من جميع الجداول
    console.log('\n📤 استخراج البيانات من الجداول...');
    const allData = {};
    
    for (const tableName of Object.keys(tableStructures)) {
      allData[tableName] = await extractTableData(tableName);
    }
    
    // حفظ البيانات في ملفات
    await saveDataToFiles(allData);
    
    // إنشاء سكريبت SQL
    await generateSQLScript(allData);
    
    // إنشاء تقرير التصدير
    await generateExportReport(allData, existingTables);
    
    console.log('\n✅ تمت عملية نقل البيانات بنجاح!');
    console.log('📁 البيانات محفوظة في مجلد: ./exported_data');
    console.log('📄 ملفات التصدير:');
    console.log('   - complete_database_export.json (جميع البيانات)');
    console.log('   - [table_name].json (ملف منفصل لكل جدول)');
    console.log('   - import_script.sql (سكريبت استيراد SQL)');
    console.log('   - export_report.json (تقرير التصدير)');
    
  } catch (error) {
    console.error('❌ خطأ في عملية نقل البيانات:', error);
  } finally {
    await pool.end();
  }
}

// تشغيل السكريبت
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as migrateDatabase };