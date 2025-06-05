#!/bin/bash

# سكريبت نشر موقع Jaberco على cPanel
# Jaberco Deployment Script for cPanel

echo "🚀 بدء عملية تحضير الموقع للنشر على cPanel"
echo "🚀 Starting Jaberco deployment preparation for cPanel"

# إنشاء مجلد النشر
echo "📁 إنشاء مجلد النشر..."
mkdir -p deployment-package
cd deployment-package

# نسخ الملفات الأساسية
echo "📋 نسخ ملفات المشروع..."
cp -r ../client ./
cp -r ../server ./
cp -r ../shared ./
cp -r ../public ./
cp -r ../migrations ./

# نسخ ملفات الإعداد
cp ../package.json ./
cp ../package-lock.json ./
cp ../tsconfig.json ./
cp ../vite.config.ts ./
cp ../tailwind.config.ts ./
cp ../postcss.config.js ./
cp ../drizzle.config.ts ./
cp ../components.json ./
cp ../.cpanel.yml ./

# نسخ ملف البيئة للإنتاج
cp ../.env.production ./.env

# إزالة الملفات غير المطلوبة
echo "🧹 تنظيف الملفات غير المطلوبة..."
rm -rf node_modules
rm -rf .git
rm -rf tmp
rm -rf exported_data
rm -rf dist

# إنشاء ملف README للنشر
cat > README-DEPLOYMENT.md << 'EOF'
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
EOF

echo "✅ تم تحضير ملفات النشر بنجاح!"
echo "📦 يمكنك الآن ضغط مجلد deployment-package ورفعه على cPanel"

# إنشاء ملف ZIP للنشر
echo "📦 إنشاء ملف ZIP للنشر..."
zip -r ../jaberco-deployment.zip . -x "*.DS_Store" "*.git*"

cd ..
echo "✅ تم إنشاء ملف jaberco-deployment.zip جاهز للرفع!"
echo "📍 الملف موجود في: jaberco-deployment.zip"