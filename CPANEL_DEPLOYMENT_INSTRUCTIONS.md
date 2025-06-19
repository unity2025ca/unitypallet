# Jaberco E-commerce - تعليمات النشر السريع على cPanel

## حزمة النشر الجاهزة
📦 **ملف النشر:** `jaberco-cpanel-deployment-complete.tar.gz`

## خطوات النشر (5 دقائق)

### 1. رفع الملفات
1. حمّل ملف `jaberco-cpanel-deployment-complete.tar.gz`
2. ادخل إلى cPanel → File Manager
3. اذهب إلى مجلد `public_html`
4. ارفع الملف المضغوط
5. فك الضغط (Extract)

### 2. إعداد Node.js في cPanel
1. اذهب إلى **Node.js App** في cPanel
2. انقر **Create Application**
3. املأ البيانات:
   - **Node.js Version:** 18+ (أو أحدث)
   - **Application Root:** `/public_html`
   - **Application URL:** `your-domain.com`
   - **Startup File:** `app.js`
4. انقر **Create**

### 3. إعداد قاعدة البيانات
1. اذهب إلى **PostgreSQL Databases** في cPanel
2. أنشئ قاعدة بيانات جديدة
3. أنشئ مستخدم جديد وربطه بقاعدة البيانات
4. احفظ معلومات الاتصال

### 4. إعداد المتغيرات البيئية
1. في Node.js App، انقر **Environment Variables**
2. أضف المتغيرات التالية:

```
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
CLOUDINARY_CLOUD_NAME=dsviwqpmy
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
SENDGRID_API_KEY=SG.your_sendgrid_key
NODE_ENV=production
SESSION_SECRET=your_random_secret_key
PORT=3000
```

### 5. استيراد قاعدة البيانات
1. اذهب إلى **phpPgAdmin** في cPanel
2. اختر قاعدة البيانات الجديدة
3. انقر **SQL** → **Execute SQL**
4. ارفع ملف `jaberco_complete_database.sql`
5. تشغيل الاستيراد

### 6. تشغيل التطبيق
1. ارجع إلى Node.js App
2. انقر **Run NPM Install** (لتثبيت التبعيات)
3. انقر **Start App**
4. تحقق من الحالة: **Running**

## البيانات المُحملة مُسبقاً

### المنتجات
- 6 منتجات Amazon return pallets حقيقية
- 28 صورة منتج من Cloudinary
- أسعار ووصف أصلي

### الإعدادات
- 83 إعداد موقع كامل
- شعار الموقع ومعلومات الاتصال
- سياسات الخصوصية والاستخدام

### الحسابات
- **الأدمن:** admin@jaberco.com / admin123
- 2 حساب عميل تجريبي

### المحتوى
- 5 أسئلة شائعة بالعربية والإنجليزية
- 4 رسائل اتصال حقيقية
- نظام شحن كامل للمدن الكندية

## اختبار النشر
1. اذهب إلى `https://your-domain.com`
2. تحقق من ظهور الصفحة الرئيسية
3. اختبر الدخول إلى لوحة التحكم: `https://your-domain.com/admin`
4. تأكد من ظهور المنتجات والصور

## الأمان
⚠️ **مهم جداً:**
1. غيّر كلمة مرور الأدمن فوراً
2. استخدم مفاتيح Stripe الحقيقية (live keys)
3. فعّل SSL للموقع
4. اعمل نسخة احتياطية من قاعدة البيانات

## الدعم الفني
📞 **للمساعدة:**
- البريد الإلكتروني: support@jaberco.com
- واتساب: +1234567890

## ملاحظات
- الموقع يدعم العربية والإنجليزية
- نظام الدفع جاهز مع Stripe
- الرسائل النصية مع Twilio
- تخزين الصور مع Cloudinary
- الإيميلات مع SendGrid

✅ **بعد اتباع هذه الخطوات، موقع Jaberco E-commerce سيكون جاهزاً للعمل مع جميع البيانات الأصلية!**