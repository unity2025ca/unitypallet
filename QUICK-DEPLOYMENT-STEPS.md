# خطوات النشر السريع لموقع Jaberco على cPanel

## الملفات الجاهزة للرفع:
- `jaberco-deployment-updated.tar.gz` (2.6 MB)

## الخطوات العملية:

### 1. رفع الملفات (5 دقائق)
```
1. ادخل إلى cPanel > File Manager
2. انتقل إلى مجلد public_html 
3. اسحب ملف jaberco-deployment-updated.tar.gz وأفلته
4. انقر بالزر الأيمن > Extract
5. احذف ملف .tar.gz بعد الاستخراج
```

### 2. إعداد قاعدة البيانات (3 دقائق)
```
cPanel > MySQL Databases:
- اسم قاعدة البيانات: jaberco_main
- اسم المستخدم: jaberco_user  
- كلمة المرور: [اختر كلمة قوية]
- الصلاحيات: ALL PRIVILEGES
```

### 3. تحديث ملف .env (2 دقيقة)
```
عدل هذه الأسطر في ملف .env:

DATABASE_URL=mysql://jaberco_user:كلمة_المرور@localhost/jaberco_main

# للحصول على مفاتيح API:
# Stripe: dashboard.stripe.com/apikeys
# Cloudinary: cloudinary.com/console  
# SendGrid: app.sendgrid.com/settings/api_keys
# Twilio: console.twilio.com
```

### 4. تثبيت التبعيات (5 دقائق)
```
cPanel > Terminal:
cd public_html
npm install --production
```

### 5. إعداد Node.js App (2 دقيقة)
```
cPanel > Node.js Apps > Create Application:
- Node.js Version: 18.x
- Application Mode: Production  
- Application Root: public_html
- Startup File: server/index.ts
- Environment Variables: انسخ من ملف .env
```

### 6. تشغيل الموقع (1 دقيقة)
```
في Node.js Apps:
- انقر Start App
- انتظر حتى تظهر حالة "Running"
- زر نطاقك لاختبار الموقع
```

## اختبار سريع:
- تحميل الصفحة الرئيسية ✓
- عرض المنتجات ✓  
- إضافة منتج للسلة ✓
- صفحة الإدارة /admin ✓

## إذا واجهت مشاكل:
1. راجع logs في cPanel > Node.js Apps
2. تحقق من اتصال قاعدة البيانات  
3. تأكد من صحة مفاتيح API
4. أعد تشغيل التطبيق

المجموع الزمني المتوقع: 15-20 دقيقة