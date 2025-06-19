# دليل النشر المباشر على AWS - خطوة بخطوة

## الملفات الجاهزة:
- jaberco-aws-ready.tar.gz (حزمة النشر الكاملة)
- جميع المتغيرات البيئية مُعدة
- التطبيق مبني ومُختبر

## خطوات النشر التفصيلية:

### 1. تحميل الحزمة للخادم
```bash
# من جهازك المحلي
scp jaberco-aws-ready.tar.gz ec2-user@18.191.29.154:/home/ec2-user/
```

### 2. الاتصال بالخادم وفك الضغط
```bash
ssh ec2-user@18.191.29.154
cd /home/ec2-user
tar -xzf jaberco-aws-ready.tar.gz
cd jaberco-github-ready
```

### 3. تثبيت Node.js (إذا لم يكن مثبتاً)
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 4. تثبيت PM2 وتشغيل التطبيق
```bash
sudo npm install -g pm2
chmod +x deploy-github.sh start-app.sh start-production-with-env.cjs
npm install --production
./deploy-github.sh
```

### 5. فتح المنفذ في الجدار الناري
```bash
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload
# أو باستخدام ufw
sudo ufw allow 5000
```

### 6. فتح المنفذ في AWS Security Group
- AWS Console → EC2 → Security Groups
- اختر Security Group الخاص بالخادم
- Edit inbound rules → Add rule
- Type: Custom TCP, Port: 5000, Source: 0.0.0.0/0

### 7. التحقق من التشغيل
```bash
pm2 status
pm2 logs jaberco-app
curl http://localhost:5000
```

## في حالة المشاكل:

### إذا فشل PM2:
```bash
cd /home/ec2-user/jaberco-github-ready
node start-production-with-env.cjs
```

### إذا كانت هناك مشاكل في الصلاحيات:
```bash
sudo chown -R ec2-user:ec2-user /home/ec2-user/jaberco-github-ready
chmod +x start-production-with-env.cjs
```

### لإعادة التشغيل:
```bash
pm2 restart jaberco-app
# أو
pm2 stop jaberco-app && pm2 start ecosystem.config.cjs
```

## النتيجة المتوقعة:
الموقع سيعمل على: http://18.191.29.154:5000

هذا الدليل يغطي جميع الخطوات المطلوبة للنشر الناجح.