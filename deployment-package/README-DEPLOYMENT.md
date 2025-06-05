# دليل النشر السريع لموقع Jaberco

## الخطوات المطلوبة على cPanel:

### 1. رفع الملفات
- اضغط جميع الملفات في ملف ZIP
- ادخل إلى cPanel > File Manager
- انتقل إلى public_html
- ارفع ملف ZIP واستخرجه

### 2. إعداد قاعدة البيانات
- ادخل إلى cPanel > MySQL Databases
- أنشئ قاعدة بيانات جديدة
- أنشئ مستخدم وربطه بقاعدة البيانات

### 3. تحديث ملف .env
- عدل ملف .env بمعلومات قاعدة البيانات الخاصة بك
- أضف جميع المفاتيح المطلوبة (Stripe, Cloudinary, إلخ)

### 4. تثبيت التبعيات
- ادخل إلى cPanel > Terminal
- نفذ: npm install

### 5. إعداد Node.js App
- ادخل إلى cPanel > Node.js Apps
- أنشئ تطبيق جديد
- اضبط Startup File على: server/index.ts

### 6. تشغيل التطبيق
- npm start
