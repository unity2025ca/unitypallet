import { createBackup, getBackupStatus } from './server/backup.js';

async function testBackupSystem() {
  console.log('اختبار نظام النسخ الاحتياطي...\n');
  
  try {
    // فحص حالة النظام
    console.log('1. فحص حالة نظام النسخ الاحتياطي:');
    const status = await getBackupStatus();
    console.log('الحالة:', status);
    
    if (!status.available) {
      console.log('❌ نظام النسخ الاحتياطي غير متوفر');
      return;
    }
    
    console.log('✅ نظام النسخ الاحتياطي جاهز');
    
    // إنشاء نسخة احتياطية
    console.log('\n2. بدء إنشاء النسخة الاحتياطية:');
    const backupResult = await createBackup();
    
    if (backupResult.success) {
      console.log('✅ تم إنشاء النسخة الاحتياطية بنجاح!');
      console.log('الرسالة:', backupResult.message);
      console.log('إجمالي السجلات:', backupResult.totalRecords);
      console.log('الجداول المنسوخة:', backupResult.tablesBackedUp?.join(', '));
    } else {
      console.log('❌ فشل في إنشاء النسخة الاحتياطية');
      console.log('الخطأ:', backupResult.message);
      if (backupResult.error) {
        console.log('تفاصيل الخطأ:', backupResult.error);
      }
    }
    
  } catch (error) {
    console.error('خطأ في اختبار النظام:', error.message);
  }
}

testBackupSystem();