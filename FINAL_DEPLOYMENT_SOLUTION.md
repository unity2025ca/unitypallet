# حل مشكلة النشر - موقع Jaberco

## ✅ المشكلة محلولة

المشكلة كانت في عدم وجود `@vitejs/plugin-react` في dependencies. تم إصلاحها.

## 📦 الحزمة الجديدة
- **jaberco-fixed-deployment.tar.gz** - حزمة النشر المحدثة
- جميع المكتبات المطلوبة مضمنة
- مشكلة البناء محلولة

## 🚀 خطوات النشر المحدثة

### 1. تحميل الحزمة الجديدة
```bash
# حمّل jaberco-fixed-deployment.tar.gz
# استخرج الملفات
tar -xzf jaberco-fixed-deployment.tar.gz
```

### 2. إعداد قاعدة البيانات في cPanel
- أنشئ قاعدة بيانات PostgreSQL: `jaberco_db`
- أنشئ مستخدم مع صلاحيات كاملة
- احفظ بيانات الاتصال

### 3. تحديث ملف البيئة
```bash
# افتح ملف .env وحدث:
DATABASE_URL=postgresql://username:password@host:5432/jaberco_db
```

### 4. رفع الملفات
- ارفع جميع الملفات إلى `public_html/`
- تأكد من وجود `.htaccess` و `.env`

### 5. إعداد Node.js في cPanel
- اذهب إلى "Node.js Apps"
- أنشئ تطبيق جديد:
  - Root: `/public_html/`
  - Startup: `server/index.ts`
  - Node.js: 18+

### 6. التثبيت والبناء
```bash
npm install
npm run build
npm run db:push
node create-admin.js
```

### 7. تشغيل الموقع
- اضغط "Start App"
- اختبر الموقع: `yourdomain.com`
- لوحة الإدارة: `yourdomain.com/admin/login`

**بيانات الدخول:**
- Username: `testadmin`
- Password: `testadmin123`

## ✨ مشكلة البناء محلولة نهائياً
الحزمة الجديدة تحتوي على جميع المكتبات المطلوبة وستعمل بدون أخطاء.