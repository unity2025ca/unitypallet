# إعداد المتغيرات البيئية - خطوات حل المشكلة

## المشكلة الحالية:
التطبيق يفشل في التشغيل بسبب عدم وجود `DATABASE_URL`

## الحل:

### 1. إنشاء ملف .env على الخادم
```bash
cd /home/ec2-user/jaberco-github-ready
cp .env.example .env
nano .env
```

### 2. إضافة المتغيرات المطلوبة في ملف .env:
```env
DATABASE_URL=postgresql://your_username:your_password@your_host:5432/your_database
SESSION_SECRET=your_secure_random_string_here
STRIPE_SECRET_KEY=sk_your_stripe_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
SENDGRID_API_KEY=your_sendgrid_key
TWILIO_ACCOUNT_SID=your_twilio_sid
NODE_ENV=production
PORT=5000
```

### 3. إعادة تشغيل التطبيق
```bash
pm2 restart jaberco-app
# أو
./start-app.sh
```

### 4. التحقق من التشغيل
```bash
pm2 logs jaberco-app
curl http://localhost:5000
```

## المتغيرات الأساسية المطلوبة:
- **DATABASE_URL**: رابط قاعدة البيانات PostgreSQL
- **SESSION_SECRET**: نص عشوائي لتأمين الجلسات

## المتغيرات الاختيارية:
- STRIPE_SECRET_KEY: للدفع الإلكتروني
- CLOUDINARY_*: لإدارة الصور
- SENDGRID_API_KEY: للإيميل
- TWILIO_*: للرسائل النصية

بعد إعداد المتغيرات البيئية، سيعمل التطبيق على:
http://18.191.29.154:5000