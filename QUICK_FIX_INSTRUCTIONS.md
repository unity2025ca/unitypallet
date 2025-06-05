# إصلاح سريع لخطأ البناء - منصة جابر كو

## المشكلة
خطأ في البناء: ملف الشعار المتحرك مفقود

## الحل السريع

### الطريقة الأولى: استخدام الحزمة المُصححة
```bash
# حذف المجلد القديم
rm -rf wsa-deployment

# استخراج الحزمة المُصححة
tar -xzf jaberco-wsa-deployment-fixed.tar.gz

# تشغيل البناء
cd wsa-deployment
npm run build:frontend
```

### الطريقة الثانية: إصلاح يدوي سريع
إذا كنت تستخدم الحزمة القديمة:

```bash
# إنشاء مجلد الأصول
mkdir -p attached_assets

# رفع ملف الشعار المتحرك إلى:
# attached_assets/IMG_2944_1749106310066.gif

# ثم تشغيل البناء
npm run build:frontend
```

## ملفات الحزم المتاحة
- `jaberco-wsa-deployment-fixed.tar.gz` - الحزمة المُصححة (تحتوي على الشعار)
- `jaberco-wsa-deployment-pm2.tar.gz` - الحزمة السابقة (بدون الشعار)

## بعد الإصلاح
```bash
# بناء الواجهة الأمامية
npm run build:frontend

# تشغيل الخادم
pm2 start server.js
pm2 save
pm2 startup
```

استخدم الحزمة المُصححة لتجنب هذه المشكلة.