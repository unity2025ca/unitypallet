# أوامر النشر المبسطة

## نسخ ولصق هذه الأوامر في خادم AWS:

```bash
# تحميل الحزمة (من جهازك المحلي)
scp jaberco-aws-ready.tar.gz ec2-user@18.191.29.154:/home/ec2-user/

# الاتصال بالخادم وتشغيل النشر
ssh ec2-user@18.191.29.154
cd /home/ec2-user
tar -xzf jaberco-aws-ready.tar.gz
cd jaberco-github-ready
sudo npm install -g pm2
npm install --production
chmod +x deploy-github.sh start-production-with-env.cjs
./deploy-github.sh

# فتح المنفذ
sudo ufw allow 5000

# التحقق من التشغيل
pm2 status
curl http://localhost:5000
```

## فتح المنفذ في AWS:
1. AWS Console → EC2 → Security Groups
2. اختر Security Group للخادم
3. Edit inbound rules → Add rule
4. Type: Custom TCP, Port: 5000, Source: 0.0.0.0/0

الموقع سيعمل على: http://18.191.29.154:5000