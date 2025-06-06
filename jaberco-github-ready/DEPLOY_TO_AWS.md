# نشر Jaberco على خادم AWS - التعليمات المبسطة

## الخطوة 1: رفع الملفات للخادم
```bash
# من جهازك المحلي
scp -r jaberco-github-ready ec2-user@18.191.29.154:/home/ec2-user/
```

## الخطوة 2: الاتصال بالخادم وتشغيل النشر
```bash
# اتصل بالخادم
ssh ec2-user@18.191.29.154

# انتقل للمجلد
cd /home/ec2-user/jaberco-github-ready

# اجعل ملف النشر قابل للتنفيذ
chmod +x deploy-github.sh

# تشغيل النشر
./deploy-github.sh
```

## الخطوة 3: فتح المنفذ 5000 في AWS Security Group
1. اذهب إلى AWS Console → EC2 → Security Groups
2. اختر Security Group الخاص بخادمك
3. اضغط "Edit inbound rules"
4. اضغط "Add rule"
5. اختر:
   - Type: Custom TCP
   - Port: 5000
   - Source: 0.0.0.0/0
6. احفظ التغييرات

## الخطوة 4: فتح المنفذ في الجدار الناري (إذا كان مفعل)
```bash
# داخل الخادم
sudo ufw allow 5000
# أو
sudo iptables -A INPUT -p tcp --dport 5000 -j ACCEPT
```

## الخطوة 5: اختبار الموقع
بعد إكمال الخطوات أعلاه، يمكنك زيارة:
**http://18.191.29.154:5000**

## استكشاف الأخطاء
```bash
# عرض حالة التطبيق
pm2 status

# عرض السجلات
pm2 logs jaberco-app

# إعادة تشغيل التطبيق
pm2 restart jaberco-app
```

## المتغيرات البيئية المطلوبة
قم بإنشاء ملف `.env` في مجلد jaberco-github-ready مع:
```
DATABASE_URL=your_database_url
STRIPE_SECRET_KEY=your_stripe_key
TWILIO_ACCOUNT_SID=your_twilio_sid
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
SENDGRID_API_KEY=your_sendgrid_key
SESSION_SECRET=your_session_secret
```