# Jaberco Website - cPanel Deployment Guide

## Prerequisites
- cPanel hosting account with Node.js support
- Database access (MySQL/PostgreSQL)
- File Manager access
- Domain configured

## Step 1: Prepare Database

### 1.1 Create Database
1. Login to cPanel
2. Go to "MySQL Databases" or "PostgreSQL Databases"
3. Create a new database named: `jaberco_db`
4. Create a database user with full privileges
5. Note down: database name, username, password, and host

### 1.2 Environment Variables
Create a `.env` file in your root directory with:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/jaberco_db

# Or for MySQL:
# DATABASE_URL=mysql://username:password@host:port/jaberco_db

# Session
SESSION_SECRET=your-super-secret-session-key-here

# Stripe (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# Cloudinary (Get from https://console.cloudinary.com/)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SendGrid (Get from https://app.sendgrid.com/settings/api_keys)
SENDGRID_API_KEY=SG.your_sendgrid_api_key

# Twilio (Get from https://console.twilio.com/)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Production settings
NODE_ENV=production
PORT=3000
```

## Step 2: Upload Files

### 2.1 Build the Project
Run locally:
```bash
npm run build
```

### 2.2 Upload to cPanel
1. Open cPanel File Manager
2. Navigate to `public_html` (or your domain's folder)
3. Upload the following files/folders:
   - `dist/` folder (contains built files)
   - `package.json`
   - `package-lock.json`
   - `.env` file
   - `node_modules/` (or install via Node.js App)

## Step 3: Configure Node.js Application

### 3.1 Setup Node.js App (if supported)
1. Go to "Node.js Apps" in cPanel
2. Click "Create Application"
3. Select Node.js version (18 or higher)
4. Set Application Root: `/public_html/`
5. Set Application URL: your domain
6. Set Startup File: `dist/index.js`
7. Click "Create"

### 3.2 Install Dependencies
In the Node.js App terminal:
```bash
npm install --production
```

### 3.3 Set Environment Variables
In the Node.js App interface:
- Add all environment variables from your `.env` file

## Step 4: Database Setup

### 4.1 Run Database Migrations
In the terminal:
```bash
npm run db:push
```

### 4.2 Create Admin User
Run this script to create an admin user:
```bash
node create-admin.js
```

## Step 5: Configure Web Server

### 5.1 .htaccess Configuration
Create `.htaccess` in `public_html`:

```apache
RewriteEngine On

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^(.*)$ /index.html [L]

# Proxy API requests to Node.js app
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options SAMEORIGIN
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static files
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

## Step 6: Start the Application

### 6.1 Start Node.js App
1. Go back to "Node.js Apps"
2. Click on your application
3. Click "Start App"
4. Ensure it shows "Running"

### 6.2 Test the Website
1. Visit your domain
2. Check that the homepage loads
3. Test admin login at `/admin/login`
4. Verify database connectivity

## Step 7: SSL Configuration

### 7.1 Enable SSL
1. Go to "SSL/TLS" in cPanel
2. Enable "Force HTTPS Redirect"
3. Install SSL certificate (Let's Encrypt or purchased)

## Troubleshooting

### Common Issues:

1. **500 Internal Server Error**
   - Check Node.js app logs
   - Verify environment variables
   - Check file permissions

2. **Database Connection Error**
   - Verify DATABASE_URL format
   - Check database credentials
   - Ensure database exists

3. **API Routes Not Working**
   - Check .htaccess configuration
   - Verify Node.js app is running
   - Check proxy settings

4. **Static Files Not Loading**
   - Verify file upload completed
   - Check file permissions (644 for files, 755 for folders)
   - Clear browser cache

### File Permissions
Set correct permissions:
```bash
find public_html -type f -exec chmod 644 {} \;
find public_html -type d -exec chmod 755 {} \;
chmod 600 .env
```

## Maintenance

### Regular Tasks:
1. Monitor Node.js app status
2. Check error logs regularly
3. Update dependencies periodically
4. Backup database regularly
5. Monitor disk space usage

### Updating the Website:
1. Build locally: `npm run build`
2. Upload new `dist/` folder
3. Restart Node.js application
4. Clear any caches

## Support
If you encounter issues:
1. Check cPanel error logs
2. Review Node.js application logs
3. Verify all environment variables are set
4. Test database connectivity
5. Contact your hosting provider for Node.js support

## Security Notes
- Never commit `.env` file to version control
- Use strong passwords for database
- Keep Node.js and dependencies updated
- Monitor for security updates
- Enable automated backups