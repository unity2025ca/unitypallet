# دليل نشر Jaberco على خادم AWS

## خطوات النشر على خادم AWS الخاص بك:

### 1. رفع الملفات للخادم
```bash
# من جهازك المحلي، قم برفع مجلد jaberco-github-ready للخادم
scp -r jaberco-github-ready ec2-user@18.191.29.154:/home/ec2-user/
```

### 2. الاتصال بالخادم وتثبيت التطبيق
```bash
# اتصل بالخادم
ssh ec2-user@18.191.29.154

# انتقل لمجلد التطبيق
cd /home/ec2-user/jaberco-github-ready

# اجعل ملف النشر قابل للتنفيذ
chmod +x deploy-github.sh

# قم بتشغيل النشر
./deploy-github.sh
```

### 3. التحقق من عمل التطبيق
```bash
# تحقق من حالة PM2
pm2 status

# عرض السجلات
pm2 logs jaberco-app

# اختبار التطبيق محلياً
curl http://localhost:5000
```

### 4. إعداد الجدار الناري (مهم جداً)
```bash
# فتح المنفذ 5000 في الجدار الناري
sudo ufw allow 5000

# أو إذا كنت تستخدم iptables
sudo iptables -A INPUT -p tcp --dport 5000 -j ACCEPT
sudo iptables-save

# التحقق من الجدار الناري
sudo ufw status
```

### 5. إعداد AWS Security Group
في لوحة تحكم AWS:
1. اذهب إلى EC2 → Security Groups
2. اختر Security Group الخاص بالخادم
3. أضف Inbound Rule جديد:
   - Type: Custom TCP
   - Port: 5000
   - Source: 0.0.0.0/0 (أو عنوان IP محدد)

### 6. اختبار الوصول الخارجي
```bash
# من داخل الخادم
curl http://18.191.29.154:5000

# من خارج الخادم (من جهازك)
curl http://18.191.29.154:5000
```

## استكشاف الأخطاء:

### إذا لم يعمل التطبيق:
```bash
# تحقق من السجلات
pm2 logs jaberco-app --lines 50

# إعادة تشغيل التطبيق
pm2 restart jaberco-app

# تشغيل التطبيق مباشرة للاختبار
cd /home/ec2-user/jaberco-github-ready
NODE_ENV=production PORT=5000 node dist/index.js
```

### إذا كان التطبيق يعمل ولكن لا يمكن الوصول إليه من الخارج:
1. تحقق من Security Group في AWS
2. تحقق من الجدار الناري في الخادم
3. تحقق من أن التطبيق يستمع على 0.0.0.0 وليس 127.0.0.1

## متطلبات النظام:
- Node.js 18+
- PM2 (سيتم تثبيته تلقائياً)
- PostgreSQL (يمكن استخدام قاعدة بيانات خارجية)

## المتغيرات البيئية المطلوبة:
يجب إعداد هذه المتغيرات في ملف .env:
- DATABASE_URL
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- SENDGRID_API_KEY
- SESSION_SECRET

## الوصول للموقع بعد النشر:
http://18.191.29.154:5000