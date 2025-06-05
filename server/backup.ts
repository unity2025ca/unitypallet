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

    console.log('بدء إنشاء النسخة الاحتياطية...');

    // البيانات التي سيتم نسخها احتياطياً
    const tables = [
      { name: 'users', method: 'getAllUsers' },
      { name: 'products', method: 'getAllProducts' },
      { name: 'product_images', method: 'getAllProductImages' },
      { name: 'settings', method: 'getAllSettings' },
      { name: 'orders', method: 'getAllOrders' },
      { name: 'order_items', method: 'getAllOrderItems' },
      { name: 'contacts', method: 'getAllContacts' },
      { name: 'appointments', method: 'getAllAppointments' },
      { name: 'faqs', method: 'getAllFaqs' },
      { name: 'notifications', method: 'getAllNotifications' }
    ];

    let totalRecords = 0;
    const tablesBackedUp: string[] = [];

    for (const table of tables) {
      try {
        console.log(`نسخ جدول: ${table.name}`);
        
        // الحصول على البيانات من التخزين المحلي
        let data: any[] = [];
        
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
          case 'orders':
            data = await storage.getAllOrders();
            break;
          case 'order_items':
            data = await storage.getAllOrderItems();
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
          case 'notifications':
            data = await storage.getAllNotifications();
            break;
        }

        if (data.length > 0) {
          // حذف البيانات القديمة من الجدول في قاعدة البيانات الاحتياطية
          await backupDb.query(`DELETE FROM ${table.name}`);
          
          // إدراج البيانات الجديدة
          for (const record of data) {
            const columns = Object.keys(record);
            const values = Object.values(record);
            const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
            
            const insertQuery = `
              INSERT INTO ${table.name} (${columns.join(', ')})
              VALUES (${placeholders})
              ON CONFLICT DO NOTHING
            `;
            
            await backupDb.query(insertQuery, values);
          }
          
          console.log(`تم نسخ ${data.length} صف من جدول ${table.name}`);
          totalRecords += data.length;
          tablesBackedUp.push(table.name);
        }
        
      } catch (error) {
        console.error(`خطأ في نسخ جدول ${table.name}:`, error);
      }
    }

    await backupDb.end();

    return {
      success: true,
      message: `تم إنشاء النسخة الاحتياطية بنجاح. تم نسخ ${totalRecords} سجل من ${tablesBackedUp.length} جدول`,
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

export async function getBackupStatus(): Promise<{ available: boolean; lastBackup?: Date }> {
  try {
    const backupUrl = process.env.NEW_DATABASE_URL;
    
    if (!backupUrl) {
      return { available: false };
    }

    const backupDb = new Pool({ 
      connectionString: backupUrl,
      ...neonConfig
    });

    // فحص وجود البيانات في قاعدة البيانات الاحتياطية
    const result = await backupDb.query('SELECT COUNT(*) as count FROM users');
    await backupDb.end();

    const hasData = parseInt(result.rows[0].count) > 0;

    return {
      available: true,
      lastBackup: hasData ? new Date() : undefined
    };

  } catch (error) {
    return { available: false };
  }
}