# دليل نشر موقع Jaberco على cPanel

## الخطوات المطلوبة:

### 1. إعداد قاعدة البيانات
- ادخل إلى cPanel
- اذهب إلى PostgreSQL أو MySQL Databases
- أنشئ قاعدة بيانات: `jaberco_db`
- أنشئ مستخدم مع صلاحيات كاملة
- احفظ بيانات الاتصال

### 2. تحديث ملف البيئة
افتح ملف `.env` وغيّر:
```
DATABASE_URL=postgresql://your_username:your_password@your_host:5432/jaberco_db
```

### 3. رفع الملفات
- ارفع جميع الملفات إلى `public_html/`
- تأكد من وجود `.htaccess` و `.env`

### 4. إعداد Node.js App
- اذهب إلى "Node.js Apps"
- أنشئ تطبيق:
  - Root: `/public_html/`
  - Startup: `server/index.ts`
  - Node.js: 18+

### 5. التثبيت والتشغيل
```bash
npm install --production
npm run build
npm run db:push
node create-admin.js
```

### 6. تشغيل الموقع
- اضغط "Start App"
- اختبر: yourdomain.com
- أدمن: yourdomain.com/admin/login

**بيانات الدخول:**
- Username: testadmin
- Password: testadmin123