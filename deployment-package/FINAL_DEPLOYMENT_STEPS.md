# Jaberco - خطوات النشر النهائية على cPanel

## 1. إعداد قاعدة البيانات
```
اذهب إلى cPanel > MySQL/PostgreSQL Databases
أنشئ قاعدة بيانات: jaberco_db
أنشئ مستخدم مع صلاحيات كاملة
احفظ: اسم المضيف، اسم المستخدم، كلمة المرور
```

## 2. تحديث ملف .env
```
افتح ملف .env
غيّر سطر DATABASE_URL إلى:
DATABASE_URL=postgresql://your_username:your_password@your_host:5432/jaberco_db

غيّر SESSION_SECRET إلى نص عشوائي طويل
```

## 3. رفع الملفات
```
ارفع جميع الملفات إلى public_html/
تأكد من وجود ملف .htaccess في المجلد الرئيسي
```

## 4. إعداد تطبيق Node.js
```
اذهب إلى cPanel > Node.js Apps
أنشئ تطبيق جديد:
- App Root: /public_html/
- Startup File: server/index.ts
- Node.js Version: 18+
```

## 5. تثبيت المكتبات
```
في terminal التطبيق:
npm install --production
npm run build
```

## 6. إعداد قاعدة البيانات
```
npm run db:push
node create-admin.js
```

## 7. تشغيل الموقع
```
اضغط "Start App"
الموقع سيكون متاح على: yourdomain.com
لوحة الإدارة: yourdomain.com/admin/login

بيانات الدخول:
Username: testadmin
Password: testadmin123
```

## ملاحظات مهمة
- جميع مفاتيح API محفوظة في ملف .env
- غيّر كلمة مرور الأدمن بعد أول دخول
- اختبر جميع الميزات قبل التشغيل الفعلي