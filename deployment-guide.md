# دليل نشر موقع Jaberco على cPanel

## المتطلبات الأساسية
- حساب استضافة يدعم Node.js (النسخة 18 أو أحدث)
- قاعدة بيانات PostgreSQL أو MySQL
- صلاحيات لرفع الملفات وإنشاء قواعد البيانات

## الطريقة الأولى: رفع الملفات مباشرة

### الخطوة 1: تحضير الملفات للنشر
1. أنشئ مجلد جديد للإنتاج
2. انسخ جميع ملفات المشروع ما عدا:
   - node_modules/
   - .git/
   - tmp/
   - exported_data/

### الخطوة 2: تحديث إعدادات الإنتاج
```bash
# في ملف package.json، تأكد من وجود:
"scripts": {
  "start": "NODE_ENV=production tsx server/index.ts",
  "build": "npm install"
}
```

### الخطوة 3: رفع الملفات
1. اضغط الملفات في ملف ZIP
2. ادخل إلى cPanel > File Manager
3. انتقل إلى public_html (أو المجلد المخصص للموقع)
4. ارفع ملف ZIP واستخرجه

### الخطوة 4: إعداد قاعدة البيانات
1. ادخل إلى cPanel > MySQL Databases
2. أنشئ قاعدة بيانات جديدة
3. أنشئ مستخدم قاعدة بيانات
4. اربط المستخدم بقاعدة البيانات مع جميع الصلاحيات

### الخطوة 5: تحديث متغيرات البيئة
أنشئ ملف `.env` في جذر المشروع:
```env
NODE_ENV=production
DATABASE_URL=mysql://username:password@localhost/database_name
SESSION_SECRET=your-secure-session-secret
STRIPE_SECRET_KEY=your-stripe-secret-key
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone
```

### الخطوة 6: تثبيت التبعيات
1. ادخل إلى cPanel > Terminal (إذا كان متاحاً)
2. انتقل إلى مجلد الموقع
3. نفذ: `npm install`

### الخطوة 7: إعداد Node.js App
1. ادخل إلى cPanel > Node.js Apps
2. انقر "Create Application"
3. اختر إصدار Node.js (18.x أو أحدث)
4. حدد مجلد التطبيق
5. اضبط Startup File على: `server/index.ts`

## الطريقة الثانية: استخدام Git

### إذا كان cPanel يدعم Git:
1. ادخل إلى cPanel > Git Version Control
2. انقر "Create Repository"
3. أدخل رابط المستودع
4. اضبط مجلد الوجهة
5. انقر "Clone"

## خطوات ما بعد النشر

### 1. تشغيل التطبيق
```bash
npm start
```

### 2. إعداد SSL
1. ادخل إلى cPanel > SSL/TLS
2. فعل SSL للنطاق

### 3. إعداد DNS (إذا لزم الأمر)
1. ادخل إلى cPanel > Zone Editor
2. اضبط A Record للنطاق

### 4. إعداد Subdomain (اختياري)
1. ادخل إلى cPanel > Subdomains
2. أنشئ subdomain للتطبيق

## استكشاف الأخطاء

### مشاكل شائعة:
1. **خطأ في قاعدة البيانات**: تأكد من صحة معلومات الاتصال
2. **خطأ في Node.js**: تأكد من الإصدار المدعوم
3. **خطأ في الصلاحيات**: تأكد من صلاحيات الملفات (755 للمجلدات، 644 للملفات)

### فحص السجلات:
```bash
# في Terminal:
tail -f logs/access.log
tail -f logs/error.log
```

## ملاحظات مهمة
- تأكد من أن استضافتك تدعم Node.js والتطبيقات الديناميكية
- احفظ نسخة احتياطية من قاعدة البيانات قبل النشر
- اختبر جميع الوظائف بعد النشر
- تأكد من تحديث جميع الروابط المطلقة للنطاق الجديد