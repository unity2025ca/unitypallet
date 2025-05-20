// سكربت للتحقق من اتصال قاعدة البيانات
// لتشغيل هذا السكربت، قم أولاً بتثبيت وحدة postgres:
// npm install postgres --save

const fs = require('fs');

// إنشاء مجلد logs إذا لم يكن موجوداً
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
  console.log('Created logs directory');
}

// التحقق من وجود متغير بيئة DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set!');
  console.log('Please set this variable in your cPanel Node.js app configuration.');
  process.exit(1);
}

let postgres;
try {
  // محاولة استيراد وحدة postgres
  postgres = require('postgres');
} catch (err) {
  console.error('Error: postgres module is not installed!');
  console.log('Please run: npm install postgres --save');
  process.exit(1);
}

async function testConnection() {
  console.log('Testing database connection...');
  
  try {
    // إنشاء اتصال بقاعدة البيانات
    const sql = postgres(process.env.DATABASE_URL, { max: 1 });
    
    // التحقق من الاتصال بإجراء استعلام بسيط
    const result = await sql`SELECT 1 as test`;
    
    if (result && result.length > 0 && result[0].test === 1) {
      console.log('✓ Database connection successful!');
      
      // التحقق من الجداول
      try {
        const tables = await sql`
          SELECT tablename FROM pg_catalog.pg_tables 
          WHERE schemaname = 'public'
        `;
        
        console.log(`\nFound ${tables.length} tables in the database:`);
        tables.forEach((table, index) => {
          console.log(`${index + 1}. ${table.tablename}`);
        });
        
        // كتابة نتيجة الاختبار إلى ملف السجل
        fs.writeFileSync('./logs/db-test-result.json', JSON.stringify({
          success: true,
          timestamp: new Date().toISOString(),
          tables: tables.map(t => t.tablename)
        }, null, 2));
        
      } catch (tableErr) {
        console.log('Could not retrieve tables list:', tableErr.message);
      }
    } else {
      console.error('✗ Database connection test failed!');
    }
    
    // إغلاق الاتصال
    await sql.end();
    
  } catch (error) {
    console.error('✗ Database connection error:', error.message);
    
    // كتابة تفاصيل الخطأ إلى ملف السجل
    fs.writeFileSync('./logs/db-connection-error.log', `
      Error Time: ${new Date().toISOString()}
      Error Message: ${error.message}
      Error Stack: ${error.stack}
      DATABASE_URL: ${process.env.DATABASE_URL ? (process.env.DATABASE_URL.substring(0, 20) + '...') : 'Not Set'}
    `);
    
    // نصائح استكشاف الأخطاء وإصلاحها
    console.log('\nTroubleshooting tips:');
    
    if (error.message.includes('connect ECONNREFUSED')) {
      console.log('- The database server may be down or not accepting connections');
      console.log('- Check if the hostname and port in DATABASE_URL are correct');
      console.log('- Verify that the database server allows external connections');
    } else if (error.message.includes('password authentication failed')) {
      console.log('- The username or password in DATABASE_URL is incorrect');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('- The specified database does not exist');
      console.log('- Create the database first using cPanel database tools');
    }
    
    console.log('\n- Verify DATABASE_URL format: postgres://username:password@hostname:port/database');
    console.log('- Check if PostgreSQL is installed and running on your host');
    console.log('- Contact your hosting provider for assistance with database connectivity');
  }
}

// تنفيذ اختبار الاتصال
testConnection()
  .then(() => {
    console.log('\nDatabase connection test completed.');
  })
  .catch(err => {
    console.error('Unexpected error during testing:', err);
  });