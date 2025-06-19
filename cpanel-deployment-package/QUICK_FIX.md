# حل سريع لتشغيل التطبيق على AWS

## المشكلة المكتشفة:
ملف تكوين PM2 لم يعد بالاسم الصحيح - تم إصلاحه الآن.

## الحل السريع:

### على خادم AWS، قم بتشغيل:
```bash
cd /home/ec2-user/jaberco-github-ready

# إصلاح إذونات الملفات
chmod +x deploy-github.sh
chmod +x start-app.sh

# تشغيل التطبيق بالطريقة المباشرة
./start-app.sh
```

### إذا فشل، جرب:
```bash
# تشغيل مباشر
NODE_ENV=production PORT=5000 node dist/index.js
```

### للتحقق من التشغيل:
```bash
# اختبار داخلي
curl http://localhost:5000

# عرض السجلات
tail -f logs/app.log
```

## تأكد من:
1. ✅ فتح المنفذ 5000 في AWS Security Group
2. ✅ إعداد ملف .env مع جميع المفاتيح
3. ✅ تشغيل التطبيق بنجاح

بعد ذلك ستتمكن من الوصول عبر:
http://18.191.29.154:5000