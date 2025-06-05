# دليل نقل بيانات موقع Jaberco

## ✅ الملفات المتوفرة:

1. **jaberco_database_export_manual.sql** - ملف SQL يحتوي على جميع البيانات المهمة
2. **import-database.js** - سكريپت لاستيراد البيانات تلقائياً
3. **export-database.js** - سكريپت لتصدير البيانات

## البيانات المُصدرة:

### المستخدمين (6 مستخدمين):
- badr (admin)
- hiba (publisher) 
- roula (publisher)
- Çfçfşşfflld (admin)
- testtest (customer)
- jldfvhjdvjcvjkcv (user)

### المنتجات (6 منتجات):
- high quality pallet 35-40 items ($1800)
- Brand new close box ($1750)
- High-quality pallets ($999)
- High-quality pallets 25-30 items ($750)
- High-quality pallets 30-40 items ($1250)
- New 750$ pallets 25-30 items ($750)

### صور المنتجات (28 صورة):
- جميع صور المنتجات مع روابط Cloudinary

### الإعدادات (13 إعداد أساسي):
- شعار الموقع
- الألوان الأساسية
- معلومات الاتصال
- إعدادات الصفحة الرئيسية

## طرق نقل البيانات:

### الطريقة الأولى - استخدام ملف SQL:
```bash
# في قاعدة البيانات الجديدة
psql -h hostname -U username -d database_name -f jaberco_database_export_manual.sql
```

### الطريقة الثانية - استخدام السكريپت:
```bash
node import-database.js "postgresql://username:password@host:port/database"
```

### الطريقة الثالثة - نسخ يدوي:
1. افتح ملف SQL
2. انسخ كل قسم على حدة
3. نفذ في قاعدة البيانات الجديدة

## التحقق من النقل:
```sql
SELECT COUNT(*) FROM users;      -- يجب أن يكون 6
SELECT COUNT(*) FROM products;   -- يجب أن يكون 6
SELECT COUNT(*) FROM product_images; -- يجب أن يكون 28
SELECT COUNT(*) FROM settings;   -- يجب أن يكون 13
```

## ملاحظات مهمة:
- جميع كلمات المرور مُشفرة
- روابط الصور محفوظة في Cloudinary
- الإعدادات تحتوي على شعار الموقع والألوان
- بيانات العملاء والطلبات محفوظة

أي طريقة تفضل لنقل البيانات؟