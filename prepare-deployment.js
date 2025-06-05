#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing Jaberco website for cPanel deployment...\n');

// Check if dist folder exists
if (!fs.existsSync('dist')) {
  console.error('❌ Error: dist folder not found. Please run "npm run build" first.');
  process.exit(1);
}

// Create deployment checklist
const checklist = `
📋 CPANEL DEPLOYMENT CHECKLIST FOR JABERCO

✅ BEFORE UPLOADING:
□ Run "npm run build" successfully
□ Copy .env.production to .env and fill in your actual values
□ Have database credentials ready
□ Have API keys ready (Stripe, Cloudinary, SendGrid, Twilio)

📁 FILES TO UPLOAD TO CPANEL public_html:
□ dist/ folder (complete)
□ .htaccess file
□ .env file (with your actual values)
□ package.json
□ package-lock.json
□ create-admin.js
□ drizzle.config.ts
□ shared/ folder

🔧 CPANEL SETUP STEPS:
1. Create database in cPanel (MySQL/PostgreSQL)
2. Upload files using File Manager
3. Set up Node.js App:
   - Application Root: /public_html/
   - Startup File: dist/index.js
   - Node.js Version: 18+
4. Install dependencies: npm install --production
5. Set environment variables in Node.js App
6. Run: npm run db:push
7. Run: node create-admin.js
8. Start the application

🌐 POST-DEPLOYMENT:
□ Test homepage loads
□ Test admin login (/admin/login)
□ Test database connectivity
□ Enable SSL certificate
□ Configure domain DNS if needed

📞 SUPPORT:
- Check Node.js App logs for errors
- Verify all environment variables are set
- Ensure database connection works
- Contact hosting provider for Node.js support

💡 CREDENTIALS NEEDED:
□ Database: host, username, password, database name
□ Stripe: secret key, public key
□ Cloudinary: cloud name, API key, API secret
□ SendGrid: API key
□ Twilio: account SID, auth token, phone number
`;

// Write checklist to file
fs.writeFileSync('DEPLOYMENT_CHECKLIST.txt', checklist);

console.log('✅ Deployment preparation complete!');
console.log('\n📋 Check DEPLOYMENT_CHECKLIST.txt for step-by-step instructions');
console.log('📖 Read DEPLOYMENT_GUIDE.md for detailed deployment guide');
console.log('\n⚠️  Important: Copy .env.production to .env and add your actual API keys before uploading!');