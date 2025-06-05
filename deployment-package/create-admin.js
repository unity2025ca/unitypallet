// برنامج لإعادة تعيين كلمة المرور للمستخدم badr أو إنشاء مستخدم جديد إذا كان غير موجود
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function resetAdminPassword() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found in environment');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // الكلمة الجديدة: admin123
    const newPassword = await hashPassword('admin123');
    
    // تحقق مما إذا كان المستخدم موجودًا
    const { rows: existingUsers } = await pool.query('SELECT * FROM users WHERE username = $1', ['badr']);
    
    if (existingUsers.length > 0) {
      // تحديث كلمة المرور للمستخدم الموجود
      await pool.query(
        'UPDATE users SET password = $1 WHERE username = $2',
        [newPassword, 'badr']
      );
      console.log('تم تحديث كلمة المرور للمستخدم: badr');
    } else {
      // إنشاء مستخدم جديد
      await pool.query(
        'INSERT INTO users (username, password, is_admin, role_type) VALUES ($1, $2, $3, $4)',
        ['badr', newPassword, true, 'admin']
      );
      console.log('تم إنشاء مستخدم جديد باسم: badr');
    }
    
    console.log('كلمة المرور الجديدة: admin123');
  } catch (error) {
    console.error('حدث خطأ أثناء تحديث/إنشاء المستخدم:', error);
  } finally {
    await pool.end();
  }
}

resetAdminPassword().catch(console.error);