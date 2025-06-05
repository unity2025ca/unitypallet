# دليل النشر من GitHub إلى WSA

## خطوات النشر

### 1. رفع المشروع إلى GitHub
```bash
# إنشاء مستودع جديد على GitHub
# ثم رفع الملفات

git init
git add .
git commit -m "Initial commit - Jaberco E-commerce Platform"
git branch -M main
git remote add origin https://github.com/yourusername/jaberco-ecommerce.git
git push -u origin main
```

### 2. استيراد من GitHub إلى WSA
```bash
# في خادم WSA
git clone https://github.com/yourusername/jaberco-ecommerce.git
cd jaberco-ecommerce
```

### 3. تشغيل سكريبت النشر
```bash
chmod +x deploy-github.sh
./deploy-github.sh
```

### 4. أو النشر اليدوي
```bash
# نسخ ملف البيئة وتكوينه
cp .env.example .env
nano .env

# تثبيت التبعيات
npm install

# بناء الواجهة الأمامية
npm run build:frontend

# إنشاء مجلد اللوجز
mkdir -p logs

# تشغيل باستخدام PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## أوامر الإدارة
```bash
# فحص الحالة
pm2 status

# مشاهدة اللوجز
pm2 logs jaberco-ecommerce

# إعادة التشغيل
pm2 restart jaberco-ecommerce

# إيقاف
pm2 stop jaberco-ecommerce
```

## ملاحظات مهمة
- يجب تكوين جميع متغيرات البيئة في ملف .env
- التأكد من وصول قاعدة البيانات PostgreSQL
- المنفذ الافتراضي: 3000
- الملفات المطلوبة تم تضمينها في المستودع
- ملف الشعار المتحرك موجود في attached_assets/