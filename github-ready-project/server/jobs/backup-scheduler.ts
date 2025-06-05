import cron from 'node-cron';
import { createBackup, getBackupStatus } from '../backup';

let isBackupRunning = false;

export function startBackupScheduler() {
  console.log('تشغيل جدولة النسخ الاحتياطي التلقائي...');
  
  // تشغيل النسخ الاحتياطي كل 24 ساعة في الساعة 2:00 صباحاً
  cron.schedule('0 2 * * *', async () => {
    if (isBackupRunning) {
      console.log('النسخ الاحتياطي قيد التشغيل بالفعل، تخطي هذه المرة');
      return;
    }

    console.log('بدء النسخ الاحتياطي التلقائي اليومي...');
    isBackupRunning = true;

    try {
      // فحص توفر نظام النسخ الاحتياطي
      const status = await getBackupStatus();
      
      if (!status.available) {
        console.log('نظام النسخ الاحتياطي غير متوفر، تخطي النسخ التلقائي');
        return;
      }

      // تنفيذ النسخ الاحتياطي
      const result = await createBackup();
      
      if (result.success) {
        console.log('✅ تم إكمال النسخ الاحتياطي التلقائي بنجاح');
        console.log(`تم نسخ ${result.totalRecords} سجل من ${result.tablesBackedUp?.length} جدول`);
      } else {
        console.error('❌ فشل النسخ الاحتياطي التلقائي:', result.message);
      }

    } catch (error) {
      console.error('خطأ في النسخ الاحتياطي التلقائي:', error);
    } finally {
      isBackupRunning = false;
    }
  }, {
    timezone: "America/Toronto" // توقيت كندا
  });

  // نسخة احتياطية فورية عند بدء تشغيل الخادم (اختيارية)
  setTimeout(async () => {
    console.log('فحص إمكانية إجراء نسخ احتياطي أولي...');
    
    try {
      const status = await getBackupStatus();
      
      if (status.available && !status.lastBackup) {
        console.log('لم يتم العثور على نسخ احتياطية سابقة، بدء النسخ الأولي...');
        
        isBackupRunning = true;
        const result = await createBackup();
        
        if (result.success) {
          console.log('✅ تم إكمال النسخ الاحتياطي الأولي بنجاح');
        }
        
        isBackupRunning = false;
      }
    } catch (error) {
      console.log('تخطي النسخ الاحتياطي الأولي:', error instanceof Error ? error.message : 'خطأ غير معروف');
      isBackupRunning = false;
    }
  }, 10000); // انتظار 10 ثوان بعد بدء تشغيل الخادم

  console.log('تم تكوين النسخ الاحتياطي التلقائي ليعمل يومياً في الساعة 2:00 صباحاً (توقيت كندا)');
}

export function getBackupSchedulerStatus() {
  return {
    isRunning: !isBackupRunning,
    nextRun: getNextBackupTime(),
    timezone: 'America/Toronto'
  };
}

function getNextBackupTime(): string {
  const now = new Date();
  const nextBackup = new Date();
  
  // تعيين الساعة إلى 2:00 صباحاً
  nextBackup.setHours(2, 0, 0, 0);
  
  // إذا مر الوقت اليوم، انتقل إلى الغد
  if (now.getHours() >= 2) {
    nextBackup.setDate(nextBackup.getDate() + 1);
  }
  
  return nextBackup.toLocaleString('ar-EG', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}