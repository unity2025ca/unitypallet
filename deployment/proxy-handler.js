// سكربت وسيط لاستقبال وتوجيه طلبات API بشكل صحيح في cPanel
// هذا السكربت يعمل كطبقة وسيطة لحل مشكلة توجيه الطلبات

const http = require('http');
const fs = require('fs');

// إنشاء مجلد السجلات إذا لم يكن موجودًا
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
}

// الحصول على المنفذ من متغيرات البيئة أو استخدام القيمة الافتراضية 8080
const proxyPort = process.env.PROXY_PORT || 8080;
// منفذ تطبيق Node.js الأساسي
const appPort = process.env.PORT || 3000;

// إنشاء سجل لتتبع الطلبات
function logRequest(req, status, error) {
  const date = new Date().toISOString();
  const log = `[${date}] ${req.method} ${req.url} - Status: ${status} ${error ? '- Error: ' + error : ''}`;
  
  console.log(log);
  fs.appendFileSync('./logs/proxy.log', log + '\n');
}

// إنشاء خادم HTTP للوسيط
const server = http.createServer((req, res) => {
  // التحقق مما إذا كان الطلب يبدأ بـ /api
  if (req.url.startsWith('/api')) {
    // استلام بيانات الطلب
    let body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    });
    
    req.on('end', () => {
      body = Buffer.concat(body).toString();
      
      // إنشاء خيارات لتوجيه الطلب إلى التطبيق الأساسي
      const options = {
        hostname: 'localhost',
        port: appPort,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: `localhost:${appPort}`
        }
      };
      
      // إنشاء طلب للتطبيق الأساسي
      const proxyReq = http.request(options, (proxyRes) => {
        // ضبط رؤوس الاستجابة
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        
        // نقل بيانات الاستجابة إلى العميل
        proxyRes.pipe(res);
        
        // تسجيل الطلب
        logRequest(req, proxyRes.statusCode);
      });
      
      // معالجة أخطاء الطلب
      proxyReq.on('error', (error) => {
        console.error('Proxy error:', error);
        res.writeHead(502);
        res.end('Proxy Error: ' + error.message);
        
        // تسجيل الخطأ
        logRequest(req, 502, error.message);
      });
      
      // إرسال بيانات الطلب إلى التطبيق الأساسي
      if (body) {
        proxyReq.write(body);
      }
      
      proxyReq.end();
    });
  } else {
    // للطلبات غير المتعلقة بـ API، إعادة توجيه إلى الصفحة الرئيسية
    res.writeHead(302, {
      'Location': '/'
    });
    res.end();
    
    // تسجيل الطلب
    logRequest(req, 302);
  }
});

// بدء تشغيل الخادم
server.listen(proxyPort, () => {
  console.log(`Proxy server running on port ${proxyPort}`);
  console.log(`Forwarding API requests to port ${appPort}`);
  
  // كتابة معلومات التشغيل إلى ملف للتتبع
  fs.writeFileSync('./logs/proxy-info.json', JSON.stringify({
    started: new Date().toISOString(),
    proxyPort,
    appPort,
    env: process.env.NODE_ENV
  }, null, 2));
});

// معالجة إغلاق الخادم بشكل آمن
process.on('SIGINT', () => {
  console.log('Stopping proxy server');
  server.close();
  process.exit();
});

// إضافة معالجة للأخطاء غير المتوقعة
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  fs.appendFileSync('./logs/proxy-errors.log', `[${new Date().toISOString()}] Uncaught exception: ${error.message}\n${error.stack}\n\n`);
});