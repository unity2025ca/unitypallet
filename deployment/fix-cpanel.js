// يجب تشغيل هذا الملف على cPanel للتحقق من إعدادات البيئة
const fs = require('fs');

// إنشاء مجلد logs إذا لم يكن موجوداً
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
  console.log('Created logs directory');
}

// التحقق من متغيرات البيئة الأساسية
const requiredEnvVars = [
  'DATABASE_URL',
  'NODE_ENV',
  'PORT',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'STRIPE_SECRET_KEY',
  'VITE_STRIPE_PUBLIC_KEY'
];

console.log('Checking environment variables...');
const missingVars = [];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
    console.log(`Missing: ${varName}`);
  } else {
    // لأسباب أمنية، لا نطبع القيمة الكاملة للمتغيرات الحساسة
    if (varName.includes('URL') || varName.includes('KEY') || varName.includes('SECRET')) {
      console.log(`${varName} is set (starts with: ${process.env[varName].substring(0, 5)}...)`);
    } else {
      console.log(`${varName} = ${process.env[varName]}`);
    }
  }
});

if (missingVars.length > 0) {
  console.log(`\nMissing environment variables: ${missingVars.join(', ')}`);
  console.log('Please set these variables in the Node.js app configuration in cPanel.');
} else {
  console.log('\nAll required environment variables are set.');
}

// فحص وجود المجلدات والملفات المهمة
console.log('\nChecking important directories and files:');
const criticalPaths = [
  './dist',
  './dist/index.js',
  './dist/public',
  './node_modules',
  './package.json',
  './.htaccess'
];

criticalPaths.forEach(path => {
  if (fs.existsSync(path)) {
    console.log(`✓ ${path} exists`);
    
    // فحص إضافي للمجلدات
    if (path === './dist/public' || path === './node_modules') {
      const items = fs.readdirSync(path);
      if (items.length === 0) {
        console.log(`  Warning: ${path} is empty!`);
      } else {
        console.log(`  ${path} contains ${items.length} items`);
        if (path === './dist/public') {
          // فحص وجود ملفات الواجهة الأمامية
          const hasIndex = fs.existsSync(`${path}/index.html`);
          const hasAssets = fs.existsSync(`${path}/assets`);
          console.log(`  - index.html exists: ${hasIndex}`);
          console.log(`  - assets directory exists: ${hasAssets}`);
        }
      }
    }
  } else {
    console.log(`✗ ${path} missing!`);
  }
});

// كتابة معلومات التشخيص إلى ملف
const diagInfo = {
  nodeVersion: process.version,
  platform: process.platform,
  cwd: process.cwd(),
  env: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    // لا تقم بتسجيل المتغيرات الحساسة كاملة
    DATABASE_URL_SET: !!process.env.DATABASE_URL,
    CLOUDINARY_CLOUD_NAME_SET: !!process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY_SET: !!process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET_SET: !!process.env.CLOUDINARY_API_SECRET,
    STRIPE_SECRET_KEY_SET: !!process.env.STRIPE_SECRET_KEY,
    VITE_STRIPE_PUBLIC_KEY_SET: !!process.env.VITE_STRIPE_PUBLIC_KEY
  },
  directories: fs.readdirSync('.'),
};

fs.writeFileSync('./logs/diagnostics.json', JSON.stringify(diagInfo, null, 2));
console.log('\nDiagnostic information written to ./logs/diagnostics.json');

// فحص اتصال قاعدة البيانات (اختياري - يعمل فقط إذا كان لديك وحدة postgres)
console.log('\nNote: To test database connection, install the postgres module:');
console.log('npm install postgres --save');
console.log('Then run a test script to verify database connection.');

// نصائح إضافية
console.log('\nTroubleshooting tips:');
console.log('1. Check if Node.js version matches your local environment');
console.log('2. Verify all environment variables are correctly set in cPanel');
console.log('3. Make sure .htaccess is properly configured for your domain');
console.log('4. Check logs directory for any error messages');
console.log('5. If needed, restart the application from cPanel Node.js interface');