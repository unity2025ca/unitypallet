# دليل نشر موقع Jaberco على cPanel - الدليل الشامل

## محتويات الحزمة المحضرة
تم إنشاء حزمة النشر `jaberco-deployment.tar.gz` (2.6 MB) التي تحتوي على:
- جميع ملفات المشروع المطلوبة
- إعدادات الإنتاج
- دليل النشر المفصل

## المتطلبات الأساسية لاستضافة cPanel

### 1. متطلبات الخادم
- Node.js الإصدار 18.x أو أحدث
- دعم تطبيقات Node.js في cPanel
- قاعدة بيانات MySQL أو PostgreSQL
- SSL Certificate
- مساحة تخزين 100 MB على الأقل

### 2. الحسابات والمفاتيح المطلوبة
قبل النشر، تأكد من حصولك على:
- **Stripe**: مفاتيح الدفع للبيئة المباشرة
- **Cloudinary**: حساب لإدارة الصور
- **SendGrid**: مفتاح API لإرسال الإيميلات
- **Twilio**: بيانات الحساب لإرسال الرسائل النصية

## خطوات النشر التفصيلية

### الخطوة 1: رفع الملفات على cPanel

1. **تسجيل الدخول إلى cPanel**
   - ادخل إلى لوحة تحكم cPanel الخاصة بك
   - انتقل إلى File Manager

2. **رفع حزمة النشر**
   - انتقل إلى مجلد `public_html` (أو المجلد المخصص لنطاقك)
   - ارفع ملف `jaberco-deployment.tar.gz`
   - انقر بالزر الأيمن على الملف واختر "Extract"

3. **ترتيب الملفات**
   - تأكد من وجود جميع المجلدات: client, server, shared, public
   - تحقق من وجود ملفات package.json و .env

### الخطوة 2: إعداد قاعدة البيانات

1. **إنشاء قاعدة البيانات**
   ```
   cPanel > MySQL Databases > Create New Database
   اسم قاعدة البيانات: jaberco_db
   ```

2. **إنشاء مستخدم قاعدة البيانات**
   ```
   MySQL Users > Add New User
   اسم المستخدم: jaberco_user
   كلمة المرور: [كلمة مرور قوية]
   ```

3. **ربط المستخدم بقاعدة البيانات**
   ```
   Add User To Database
   اختر المستخدم وقاعدة البيانات
   امنح جميع الصلاحيات (ALL PRIVILEGES)
   ```

### الخطوة 3: تحديث إعدادات البيئة

عدل ملف `.env` في جذر المشروع:

```env
NODE_ENV=production
PORT=5000

# Database - استبدل بمعلومات قاعدة البيانات الخاصة بك
DATABASE_URL=mysql://jaberco_user:your_password@localhost/jaberco_db

# Security - أنشئ كلمة مرور قوية
SESSION_SECRET=your-super-secure-session-secret-key-here

# Stripe - مفاتيح البيئة المباشرة
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key

# Cloudinary - بيانات حسابك
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SendGrid - مفتاح API
SENDGRID_API_KEY=SG.your_sendgrid_api_key

# Twilio - بيانات الحساب
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### الخطوة 4: تثبيت التبعيات

1. **فتح Terminal في cPanel**
   ```bash
   cd public_html
   npm install --production
   ```

2. **في حالة عدم توفر Terminal**
   - استخدم SSH إذا كان متاحاً
   - أو اتصل بالدعم الفني لتثبيت التبعيات

### الخطوة 5: إعداد تطبيق Node.js

1. **انتقل إلى Node.js Apps في cPanel**
2. **أنشئ تطبيق جديد**
   ```
   Node.js Version: 18.x أو أحدث
   Application Mode: Production
   Application Root: public_html (أو مسار مجلدك)
   Application URL: نطاقك الأساسي
   Startup File: server/index.ts
   ```

3. **ضبط متغيرات البيئة**
   - أضف جميع المتغيرات من ملف .env
   - تأكد من صحة جميع القيم

### الخطوة 6: إعداد SSL

1. **انتقل إلى SSL/TLS في cPanel**
2. **فعل Let's Encrypt SSL (مجاني)**
   - أو ارفع شهادة SSL مخصصة
3. **فعل Force HTTPS Redirect**

### الخطوة 7: تشغيل التطبيق

1. **في Node.js Apps**
   - انقر على "Start App"
   - تحقق من حالة التطبيق (Running)

2. **اختبار الموقع**
   - زر نطاقك في المتصفح
   - تأكد من تحميل الصفحة الرئيسية
   - اختبر تسجيل الدخول والوظائف الأساسية

## إعدادات DNS (إذا لزم الأمر)

### للنطاق الرئيسي
```
Type: A Record
Name: @
Value: [عنوان IP للخادم]
TTL: 3600
```

### للنطاق الفرعي
```
Type: CNAME
Name: www
Value: yourdomain.com
TTL: 3600
```

## استكشاف الأخطاء الشائعة

### مشكلة 1: خطأ في قاعدة البيانات
```
الحل:
- تحقق من صحة DATABASE_URL
- تأكد من صلاحيات المستخدم
- تحقق من اتصال قاعدة البيانات
```

### مشكلة 2: خطأ في تحميل الصفحات
```
الحل:
- تحقق من logs في cPanel
- تأكد من تشغيل تطبيق Node.js
- راجع إعدادات Startup File
```

### مشكلة 3: خطأ في الصور
```
الحل:
- تحقق من إعدادات Cloudinary
- تأكد من صحة API Keys
- اختبر الاتصال بـ Cloudinary
```

### مشكلة 4: خطأ في المدفوعات
```
الحل:
- تحقق من مفاتيح Stripe
- تأكد من استخدام مفاتيح البيئة المباشرة
- اختبر webhook URLs
```

## أوامر مفيدة للصيانة

### فحص حالة التطبيق
```bash
# فحص العمليات النشطة
ps aux | grep node

# فحص استخدام الذاكرة
free -h

# فحص مساحة القرص
df -h
```

### فحص السجلات
```bash
# سجلات التطبيق
tail -f logs/app.log

# سجلات الخطأ
tail -f logs/error.log

# سجلات الوصول
tail -f logs/access.log
```

### إعادة تشغيل التطبيق
```bash
# في Node.js Apps
Stop App > Start App

# أو عبر Terminal
npm restart
```

## نصائح مهمة للأمان

1. **النسخ الاحتياطية**
   - أنشئ نسخة احتياطية يومية لقاعدة البيانات
   - احفظ نسخة من ملفات المشروع

2. **تحديث المفاتيح**
   - غير SESSION_SECRET بانتظام
   - راقب استخدام API keys
   - فعل 2FA على جميع الحسابات

3. **مراقبة الأداء**
   - راقب استخدام الذاكرة والمعالج
   - فحص سرعة الموقع بانتظام
   - راقب أخطاء قاعدة البيانات

## الدعم الفني

في حالة مواجهة مشاكل:
1. راجع logs في cPanel
2. تحقق من حالة جميع الخدمات
3. اتصل بالدعم الفني لمزود الاستضافة
4. تأكد من تحديث جميع المفاتيح والإعدادات

---

تم تحضير هذا الدليل لضمان نشر ناجح لموقع Jaberco على cPanel. تأكد من اتباع جميع الخطوات بعناية واختبار الموقع بعد كل خطوة.