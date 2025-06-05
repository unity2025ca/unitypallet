# دليل النشر المبسط - موقع Jaberco

## حل مشكلة الحزم نهائياً

### الطريقة البديلة - نشر بدون npm build

بدلاً من استخدام `npm run build` الذي يسبب مشاكل، استخدم هذه الطريقة:

## خطوات النشر المبسطة:

### 1. إعداد قاعدة البيانات
- أنشئ قاعدة بيانات PostgreSQL: `jaberco_db`
- حدث ملف `.env` بمعلومات قاعدة البيانات

### 2. رفع الملفات
- ارفع جميع الملفات إلى `public_html/`

### 3. إعداد Node.js App
- أنشئ تطبيق Node.js في cPanel
- Startup File: `server/index.ts`

### 4. التثبيت المبسط
```bash
# ثبت المكتبات الأساسية فقط
npm install express @neondatabase/serverless drizzle-orm drizzle-kit stripe @sendgrid/mail twilio cloudinary passport express-session tsx

# إعداد قاعدة البيانات
npm run db:push

# إنشاء المدير
node create-admin.js
```

### 5. تشغيل الموقع
```bash
# تشغيل مباشر بدون build
npm run dev
```

## بديل آخر - استخدام dist محلي
إذا كانت المشكلة مستمرة:
1. قم ببناء المشروع محلياً على جهازك
2. ارفع مجلد `dist` الناتج
3. شغّل: `node dist/index.js`

## بيانات الدخول
- الموقع: yourdomain.com
- لوحة الإدارة: yourdomain.com/admin/login
- المستخدم: testadmin
- كلمة المرور: testadmin123