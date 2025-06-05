# Jaberco E-commerce Platform - WSA Deployment Guide

## Overview
Complete deployment guide for Jaberco Arabic e-commerce platform on WSA hosting with AWS Systems Manager Parameter Store integration.

## Quick Deployment Steps

### 1. Clone Repository
```bash
git clone [your-github-repository-url]
cd jaberco-github-deployment
```

### 2. Configure AWS Parameter Store
Follow the complete setup in `AWS_PARAMETER_STORE_SETUP.md` to configure all secrets in AWS Systems Manager Parameter Store.

### 3. Set Environment Variables
```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export NODE_ENV=production
```

### 4. Install Dependencies and Build
```bash
npm install
npm run build
```

### 5. Deploy with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup auto-restart on system reboot
pm2 startup
```

### 6. Verify Deployment
```bash
# Check application status
pm2 status

# View logs
pm2 logs jaberco-app

# Check application health
curl http://localhost:5000/api/health
```

## Features Included

### Core E-commerce Platform
- ✅ Complete Arabic/English multilingual support
- ✅ Product catalog with image management
- ✅ Shopping cart and checkout system
- ✅ Stripe payment integration
- ✅ Order management system
- ✅ Customer authentication

### Admin Dashboard
- ✅ Complete admin panel with role-based access
- ✅ Publisher permissions for content management
- ✅ Product management with Cloudinary integration
- ✅ Order and customer management
- ✅ System settings and configuration

### Advanced Features
- ✅ Animated Jaberco logo loading screens
- ✅ Automated backup system with scheduler
- ✅ SMS notifications via Twilio
- ✅ Email notifications via SendGrid
- ✅ Security middleware and brute force protection
- ✅ Visitor analytics and tracking

### AWS Integration
- ✅ AWS Systems Manager Parameter Store for secrets
- ✅ Automatic fallback to environment variables
- ✅ Secure credential management
- ✅ Production-ready configuration

## File Structure
```
jaberco-github-deployment/
├── client/                 # React frontend
├── server/                 # Express backend
├── shared/                 # Shared schemas and types
├── public/                 # Static assets
├── aws-secrets.js          # AWS Parameter Store integration
├── ecosystem.config.js     # PM2 configuration
├── package.json            # Dependencies and scripts
├── drizzle.config.ts       # Database configuration
└── deployment docs/        # Setup guides
```

## Database Setup
The application uses PostgreSQL with Drizzle ORM. Configure your database URL in AWS Parameter Store at `/jaberco/database/url`.

## SSL/HTTPS Configuration
For production deployment, configure your web server (Nginx/Apache) to handle SSL termination and proxy requests to the Node.js application running on port 5000.

## Monitoring and Maintenance
- Use `pm2 monit` for real-time monitoring
- Logs are available via `pm2 logs`
- Automatic restart on crashes via PM2
- Daily automated backups configured

## Support
- Check logs: `pm2 logs jaberco-app`
- Restart application: `pm2 restart jaberco-app`
- View processes: `pm2 list`

## Security Notes
- All sensitive data managed via AWS Parameter Store
- Production environment variables configured
- Security headers and CORS protection enabled
- Brute force protection implemented