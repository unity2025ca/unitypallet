# دليل نقل البيانات النهائي - موقع Jaberco

## ✅ الملفات الجاهزة للنقل:

1. **backup-restore-complete.sql** - نسخة احتياطية كاملة ومحسنة
2. **jaberco_database_export_manual.sql** - التصدير الأصلي
3. **migrate-to-new-db.js** - سكريپت النقل التلقائي

## البيانات المُعدة للنقل:

### المستخدمين (6 مستخدمين):
- badr (admin)
- hiba (publisher)
- roula (publisher) 
- testadmin (admin) - محدث
- testtest (customer)
- customer1 (customer) - محدث

### المنتجات (6 منتجات):
- high quality pallet 35-40 items ($1800)
- Brand new close box ($1750)
- High-quality pallets ($999)
- High-quality pallets 25-30 items ($750)
- High-quality pallets 30-40 items ($1250)
- New 750$ pallets 25-30 items ($750)

### صور المنتجات (12 صورة أساسية):
- صور محسنة مع روابط Cloudinary صالحة

### الإعدادات (11 إعداد أساسي):
- شعار الموقع وألوان العلامة التجارية
- معلومات الاتصال الصحيحة
- إعدادات الصفحة الرئيسية

## طرق النقل المتاحة:

### الطريقة الأولى - SQL مباشر (الأسرع):
```bash
psql -h hostname -U username -d new_database -f backup-restore-complete.sql
```

### الطريقة الثانية - عبر pgAdmin أو أداة إدارة:
1. افتح أداة إدارة قاعدة البيانات
2. انسخ محتوى ملف backup-restore-complete.sql
3. نفذ الاستعلام في قاعدة البيانات الجديدة

### الطريقة الثالثة - عبر واجهة الويب:
1. ادخل إلى لوحة إدارة قاعدة البيانات
2. افتح محرر SQL
3. الصق محتوى الملف ونفذه

## التحقق من النقل:
بعد تنفيذ السكريپت، ستظهر نتائج التحقق تلقائياً:
- المستخدمين: 6
- المنتجات: 6  
- صور المنتجات: 12
- الإعدادات: 11

## الخطوة التالية:
1. حدد الطريقة المفضلة للنقل
2. نفذ سكريپت backup-restore-complete.sql في قاعدة البيانات الجديدة
3. تحقق من النتائج

هل تريد المساعدة في تنفيذ أي من هذه الطرق؟