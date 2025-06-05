# Jaberco E-commerce Platform - WSA Deployment

## Overview
Advanced Arabic e-commerce platform specializing in Amazon return pallets and liquidation inventory.

## Features
- React.js frontend with TypeScript
- Express.js backend with PostgreSQL
- Arabic/English multilingual support
- Cloudinary image management
- Stripe payment integration
- Admin dashboard with comprehensive settings
- Automated backup system

## Installation Instructions

### 1. Upload Files
Upload all files to your WSA hosting directory.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
1. Copy `.env.example` to `.env`
2. Update all environment variables with your actual values:
   - Database connection string
   - Cloudinary credentials
   - Stripe keys
   - Twilio credentials
   - SendGrid API key

### 4. Database Setup
Ensure your PostgreSQL database is created and accessible.

### 5. Build and Start
```bash
npm run build:frontend
npm start
```

## Environment Variables Required

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE_NUMBER`: Twilio phone number
- `SENDGRID_API_KEY`: SendGrid API key

## Admin Access
Default admin credentials will need to be created after deployment.

## Support
Contact support for assistance with deployment or configuration.