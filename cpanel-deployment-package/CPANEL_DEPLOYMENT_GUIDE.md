# Jaberco E-commerce - دليل النشر على cPanel

## متطلبات الخادم
- Node.js 18+ (أو أحدث)
- PostgreSQL Database
- SSL Certificate (مطلوب لـ Stripe وخدمات الدفع)
- مساحة تخزين 500MB على الأقل

## خطوات النشر

### 1. رفع الملفات
1. قم برفع جميع ملفات المشروع إلى المجلد الرئيسي لموقعك في cPanel
2. تأكد من رفع ملف `.htaccess` للتوجيه الصحيح

### 2. إعداد قاعدة البيانات
1. إنشاء قاعدة بيانات PostgreSQL جديدة في cPanel
2. احفظ معلومات الاتصال (اسم المستخدم، كلمة المرور، اسم قاعدة البيانات)

### 3. إعداد المتغيرات البيئية
إنشاء ملف `.env` بالمعلومات التالية:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# Stripe Payment Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary Image Storage
CLOUDINARY_CLOUD_NAME=dsviwqpmy
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SendGrid Email Configuration
SENDGRID_API_KEY=SG.your_sendgrid_api_key

# Application Configuration
NODE_ENV=production
SESSION_SECRET=your_random_session_secret
PORT=3000
```

### 4. تثبيت التبعيات
```bash
npm install --production
```

### 5. إعداد قاعدة البيانات
```bash
# تشغيل المهاجرة لإنشاء الجداول
npm run db:push

# أو استيراد قاعدة البيانات الكاملة
psql -h hostname -U username -d database_name < database_backup.sql
```

### 6. تشغيل التطبيق
```bash
npm start
```

## إعدادات cPanel المطلوبة

### Node.js App Setup
1. اذهب إلى "Node.js App" في cPanel
2. انقر "Create Application"
3. اختر Node.js Version: 18+
4. Application Root: `/public_html` (أو مجلد موقعك)
5. Application URL: `your-domain.com`
6. Application Startup File: `index.js`

### SSL Certificate
1. اذهب إلى "SSL/TLS" في cPanel
2. قم بتثبيت شهادة SSL (Let's Encrypt مجاني)
3. فعّل "Force HTTPS Redirect"

### Environment Variables في cPanel
1. اذهب إلى Node.js App المُنشأة
2. انقر "Environment Variables"
3. أضف جميع المتغيرات من ملف `.env`

## بيانات الدخول الافتراضية

### Admin Panel
- **البريد الإلكتروني:** admin@jaberco.com
- **كلمة المرور:** admin123 (يُنصح بتغييرها فوراً)

### قاعدة البيانات المُحملة مُسبقاً
- 6 منتجات Amazon return pallets حقيقية
- 28 صورة منتج من Cloudinary
- 83 إعداد موقع كامل
- 5 أسئلة شائعة بالعربية والإنجليزية
- نظام شحن كامل للمدن الكندية

## استكشاف الأخطاء

### مشكلة: الموقع لا يعمل
- تحقق من سجلات الأخطاء في cPanel
- تأكد من صحة معلومات قاعدة البيانات في `.env`
- تحقق من أن Node.js version صحيح

### مشكلة: الصور لا تظهر
- تحقق من إعدادات Cloudinary في `.env`
- تأكد من أن الـ API keys صحيحة

### مشكلة: المدفوعات لا تعمل
- تحقق من Stripe keys (استخدم live keys في الإنتاج)
- تأكد من تفعيل SSL على الموقع

### مشكلة: الرسائل النصية لا تُرسل
- تحقق من Twilio credentials
- تأكد من تفعيل الرقم في Twilio

## الدعم الفني
للحصول على المساعدة، يرجى التواصل مع:
- البريد الإلكتروني: support@jaberco.com
- واتساب: +1234567890

## ملاحظات أمنية
1. غيّر كلمة مرور الأدمن فوراً بعد النشر
2. استخدم كلمة مرور قوية لقاعدة البيانات
3. احتفظ بنسخة احتياطية من قاعدة البيانات
4. فعّل التحديثات التلقائية للأمان