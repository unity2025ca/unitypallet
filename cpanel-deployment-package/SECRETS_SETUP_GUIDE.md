# دليل إعداد المفاتيح السرية - منصة جابر كو التجارية

## المفاتيح المطلوبة للتشغيل

### 1. قاعدة البيانات (مطلوب)
```
DATABASE_URL=postgresql://username:password@localhost:5432/jaberco_db
```
- قاعدة بيانات PostgreSQL للمنتجات والطلبات والمستخدمين

### 2. تشفير الجلسات (مطلوب)
```
SESSION_SECRET=your-super-secret-session-key
```
- مفتاح عشوائي قوي لتشفير جلسات المستخدمين

### 3. Cloudinary - إدارة الصور (مطلوب)
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```
- التسجيل: https://cloudinary.com
- لرفع وإدارة صور المنتجات والشعارات

### 4. Stripe - المدفوعات (مطلوب)
```
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```
- التسجيل: https://stripe.com
- لمعالجة المدفوعات الإلكترونية

### 5. Twilio - الرسائل النصية (مطلوب)
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```
- التسجيل: https://console.twilio.com
- لإرسال إشعارات SMS للعملاء

### 6. SendGrid - البريد الإلكتروني (مطلوب)
```
SENDGRID_API_KEY=SG.your-sendgrid-api-key
```
- التسجيل: https://sendgrid.com
- لإرسال رسائل البريد الإلكتروني

## خطوات الإعداد

### 1. نسخ ملف البيئة
```bash
cp .env.example .env
```

### 2. تحرير الملف
```bash
nano .env
# أو استخدم أي محرر نصوص
```

### 3. إدخال القيم الفعلية
- استبدل جميع القيم النموذجية بالمفاتيح الحقيقية
- تأكد من عدم وجود مسافات إضافية
- احفظ الملف

### 4. اختبار الاتصال
```bash
# تشغيل سكريبت النشر الذي يتحقق من الاتصالات
./deploy-github.sh
```

## ملاحظات مهمة
- احتفظ بنسخة آمنة من ملف .env
- لا تشارك المفاتيح السرية مع أحد
- استخدم مفاتيح الإنتاج للموقع المباشر
- تحقق من صحة جميع المفاتيح قبل النشر