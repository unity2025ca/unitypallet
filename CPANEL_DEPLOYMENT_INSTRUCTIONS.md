# Jaberco E-commerce Website - cPanel Deployment Guide

## Prerequisites
- cPanel hosting account with Node.js support (version 18 or higher)
- Database access (MySQL or PostgreSQL)
- Domain name configured

## Step 1: Extract Files
1. Download `jaberco-deployment-updated.tar.gz` from this project
2. Extract the archive to your local computer
3. You'll see these folders and files:
   - `server/` - Backend code
   - `shared/` - Database schemas
   - `src/` - Frontend source code
   - `index.html` - Main HTML file
   - Configuration files (.htaccess, package.json, etc.)

## Step 2: Database Setup
1. Login to your cPanel
2. Go to "MySQL Databases" or "PostgreSQL Databases"
3. Create a new database named `jaberco_db`
4. Create a database user with full privileges
5. Note down: hostname, username, password, database name

## Step 3: Environment Configuration
1. Copy `.env.production` to `.env`
2. Fill in your database connection:
   ```
   DATABASE_URL=postgresql://username:password@hostname:port/jaberco_db
   ```
3. Add your API keys:
   - Stripe keys (both secret and public)
   - Cloudinary credentials
   - SendGrid API key
   - Twilio credentials

## Step 4: Upload to cPanel
1. Access File Manager in cPanel
2. Navigate to `public_html/` folder
3. Upload all extracted files to this directory
4. Make sure `.htaccess` is in the root of public_html

## Step 5: Node.js Application Setup
1. Go to "Node.js Apps" in cPanel
2. Create New Application:
   - App Root: `/public_html/`
   - App URL: Your domain
   - Application startup file: `server/index.ts`
   - Node.js version: 18 or higher
3. Click "Create"

## Step 6: Install Dependencies
1. In the Node.js app interface, open terminal
2. Run: `npm install --production`
3. Wait for installation to complete

## Step 7: Build the Application
1. In the terminal, run: `npm run build`
2. This creates the production files

## Step 8: Database Migration
1. Run: `npm run db:push`
2. Run: `node create-admin.js`
3. This creates your admin account

## Step 9: Start the Application
1. Click "Start App" in the Node.js interface
2. Your website should now be live

## Default Admin Login
- URL: `yourdomain.com/admin/login`
- Username: `testadmin`
- Password: `testadmin123`

## Troubleshooting
- Check application logs in cPanel for errors
- Verify all environment variables are set
- Ensure database connection is working
- Contact your hosting provider if Node.js features aren't available

## Important Notes
- Change the default admin password after first login
- Update environment variables with your production API keys
- Test all functionality before going live
- Keep backups of your database and files