# نشر منصة جابر كو باستخدام PM2

## الملف الرئيسي
الملف الرئيسي للخادم هو: `server.js`

## طريقة النشر السريع
```bash
pm2 start server.js
pm2 save
pm2 startup
```

## طريقة النشر المتقدم (موصى بها)
```bash
# إنشاء مجلد اللوجز
mkdir logs

# تشغيل التطبيق باستخدام ملف التكوين
pm2 start ecosystem.config.js

# حفظ التكوين
pm2 save

# تشغيل تلقائي عند إعادة التشغيل
pm2 startup
```

## أوامر إدارة PM2 المفيدة
```bash
# عرض حالة التطبيقات
pm2 status

# عرض السجلات
pm2 logs jaberco-ecommerce

# إعادة تشغيل التطبيق
pm2 restart jaberco-ecommerce

# إيقاف التطبيق
pm2 stop jaberco-ecommerce

# حذف التطبيق من PM2
pm2 delete jaberco-ecommerce

# مراقبة الموارد
pm2 monit
```

## ملاحظات مهمة
- يجب تكوين متغيرات البيئة في ملف `.env` قبل التشغيل
- التطبيق سيعمل على المنفذ 3000 افتراضياً
- يمكن تغيير المنفذ عبر متغير البيئة PORT