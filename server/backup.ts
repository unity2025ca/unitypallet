import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { storage } from './storage';

const neonConfig = { webSocketConstructor: ws };

export interface BackupResult {
  success: boolean;
  message: string;
  totalRecords?: number;
  tablesBackedUp?: string[];
  error?: string;
}

export async function createBackup(): Promise<BackupResult> {
  try {
    const backupUrl = process.env.NEW_DATABASE_URL;
    
    if (!backupUrl) {
      return {
        success: false,
        message: 'عذراً، رابط قاعدة البيانات الاحتياطية غير متوفر',
        error: 'NEW_DATABASE_URL not configured'
      };
    }

    const backupDb = new Pool({ 
      connectionString: backupUrl,
      ...neonConfig
    });

    console.log('بدء إنشاء النسخة الاحتياطية مع التحقق الشامل...');

    // أولاً: التأكد من وجود الجداول في قاعدة البيانات الاحتياطية
    await ensureTablesExist(backupDb);

    // البيانات التي سيتم نسخها احتياطياً
    const tables = [
      { name: 'users', method: 'getAllUsers' },
      { name: 'products', method: 'getAllProducts' },
      { name: 'product_images', method: 'getAllProductImages' },
      { name: 'settings', method: 'getAllSettings' },
      { name: 'contacts', method: 'getAllContacts' },
      { name: 'appointments', method: 'getAllAppointments' },
      { name: 'faqs', method: 'getAllFaqs' }
    ];

    let totalRecords = 0;
    const tablesBackedUp: string[] = [];
    const verificationResults: string[] = [];

    for (const table of tables) {
      try {
        console.log(`نسخ جدول: ${table.name}`);
        
        // الحصول على البيانات من التخزين المحلي
        let data: any[] = [];
        
        try {
          switch (table.name) {
            case 'users':
              data = await storage.getAllUsers();
              break;
            case 'products':
              data = await storage.getAllProducts();
              break;
            case 'product_images':
              data = await storage.getAllProductImages();
              break;
            case 'settings':
              data = await storage.getAllSettings();
              break;
            case 'contacts':
              data = await storage.getAllContacts();
              break;
            case 'appointments':
              data = await storage.getAllAppointments();
              break;
            case 'faqs':
              data = await storage.getAllFaqs();
              break;
            default:
              console.log(`Skipping table ${table.name} - method not available`);
              continue;
          }
        } catch (methodError) {
          console.log(`Method not available for ${table.name}, skipping...`);
          continue;
        }

        if (data.length > 0) {
          // حذف البيانات القديمة من الجدول في قاعدة البيانات الاحتياطية
          await backupDb.query(`DELETE FROM ${table.name}`);
          
          // إدراج البيانات الجديدة مع التحقق من البنية
          let insertedCount = 0;
          for (const record of data) {
            try {
              // تنظيف وتحضير البيانات
              const cleanRecord = cleanRecordForInsert(record);
              const columns = Object.keys(cleanRecord);
              const values = Object.values(cleanRecord);
              const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
              
              const insertQuery = `
                INSERT INTO ${table.name} (${columns.join(', ')})
                VALUES (${placeholders})
                ON CONFLICT DO NOTHING
              `;
              
              const result = await backupDb.query(insertQuery, values);
              if (result.rowCount && result.rowCount > 0) {
                insertedCount++;
              }
            } catch (insertError) {
              console.error(`خطأ في إدراج سجل من ${table.name}:`, insertError);
            }
          }
          
          // التحقق من صحة النسخ
          const verifyResult = await backupDb.query(`SELECT COUNT(*) as count FROM ${table.name}`);
          const backupCount = parseInt(verifyResult.rows[0].count);
          
          console.log(`تم نسخ ${insertedCount} صف من ${data.length} إلى جدول ${table.name}`);
          console.log(`التحقق: يوجد ${backupCount} صف في قاعدة البيانات الاحتياطية`);
          
          verificationResults.push(`${table.name}: ${data.length} → ${backupCount} (${insertedCount} مدرج)`);
          totalRecords += insertedCount;
          tablesBackedUp.push(table.name);
        } else {
          console.log(`جدول ${table.name} فارغ`);
          verificationResults.push(`${table.name}: فارغ`);
        }
        
      } catch (error) {
        console.error(`خطأ في نسخ جدول ${table.name}:`, error);
        verificationResults.push(`${table.name}: خطأ - ${error}`);
      }
    }

    await backupDb.end();

    const message = `تم إنشاء النسخة الاحتياطية بنجاح. تم نسخ ${totalRecords} سجل من ${tablesBackedUp.length} جدول.\n\nتفاصيل التحقق:\n${verificationResults.join('\n')}`;

    return {
      success: true,
      message,
      totalRecords,
      tablesBackedUp
    };

  } catch (error) {
    console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء إنشاء النسخة الاحتياطية',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// دالة لتنظيف السجلات قبل الإدراج
function cleanRecordForInsert(record: any): any {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(record)) {
    // تخطي القيم الفارغة أو undefined
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// دالة للتأكد من وجود الجداول
async function ensureTablesExist(backupDb: any): Promise<void> {
  const createTablesSQL = `
    -- إنشاء الجداول إذا لم تكن موجودة
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT false,
      role_type VARCHAR(50) DEFAULT 'customer',
      email VARCHAR(255),
      full_name VARCHAR(255),
      phone VARCHAR(50),
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      address TEXT,
      city VARCHAR(255),
      postal_code VARCHAR(20),
      country VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      title_ar TEXT,
      description TEXT,
      description_ar TEXT,
      category VARCHAR(255),
      status VARCHAR(50) DEFAULT 'available',
      price DECIMAL(10,2),
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      display_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      is_main BOOLEAN DEFAULT false,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(255) UNIQUE NOT NULL,
      value TEXT,
      category VARCHAR(255),
      label VARCHAR(255),
      type VARCHAR(50),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      subject VARCHAR(255),
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      date DATE NOT NULL,
      time TIME NOT NULL,
      message TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      question_ar TEXT,
      answer TEXT NOT NULL,
      answer_ar TEXT,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await backupDb.query(createTablesSQL);
    console.log('تم التأكد من وجود جميع الجداول في قاعدة البيانات الاحتياطية');
  } catch (error) {
    console.error('خطأ في إنشاء الجداول:', error);
    throw error;
  }
}

export async function getBackupStatus(): Promise<{ available: boolean; lastBackup?: Date }> {
  try {
    const backupUrl = process.env.NEW_DATABASE_URL;
    
    console.log('Checking backup URL availability:', !!backupUrl);
    
    if (!backupUrl) {
      console.log('NEW_DATABASE_URL not found');
      return { available: false };
    }

    const backupDb = new Pool({ 
      connectionString: backupUrl,
      ...neonConfig
    });

    // فحص الاتصال بقاعدة البيانات الاحتياطية
    const testQuery = await backupDb.query('SELECT 1 as test');
    console.log('Backup database connection test:', testQuery.rows[0]);

    // فحص وجود جدول المستخدمين
    let hasData = false;
    try {
      const result = await backupDb.query('SELECT COUNT(*) as count FROM users');
      hasData = parseInt(result.rows[0].count) > 0;
      console.log('Users in backup database:', result.rows[0].count);
    } catch (tableError) {
      console.log('Users table does not exist in backup database yet');
    }

    await backupDb.end();

    return {
      available: true,
      lastBackup: hasData ? new Date() : undefined
    };

  } catch (error) {
    console.error('Backup status check error:', error);
    return { available: false };
  }
}