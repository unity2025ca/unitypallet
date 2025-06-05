# Jaberco E-commerce Platform

Advanced Arabic e-commerce platform specializing in Amazon return pallets and liquidation inventory.

## Features

- React.js frontend with TypeScript and Shadcn UI
- Express.js backend with PostgreSQL database
- Multilingual support (Arabic and English)
- Cloudinary image management
- Stripe payment integration
- Comprehensive admin panel
- Automated backup system
- Real-time inventory management

## Quick Deploy to WSA

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/jaberco-ecommerce.git
cd jaberco-ecommerce
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your actual values
```

### 3. Install and Build
```bash
npm install
npm run build
```

### 4. Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Required API Keys and Services

This application requires the following external services:

### Database
- **PostgreSQL**: Database for storing products, orders, users
- Configure `DATABASE_URL` connection string

### Image Management
- **Cloudinary**: Product images and logo storage
- Sign up at: https://cloudinary.com
- Configure: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Payment Processing
- **Stripe**: Credit card payments and subscriptions
- Sign up at: https://stripe.com
- Configure: `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`

### Communications
- **Twilio**: SMS notifications to customers
- Sign up at: https://console.twilio.com
- Configure: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

- **SendGrid**: Email notifications and marketing
- Sign up at: https://sendgrid.com
- Configure: `SENDGRID_API_KEY`

### Security
- **Session Secret**: Generate strong random string for `SESSION_SECRET`

See `SECRETS_SETUP_GUIDE.md` for detailed configuration instructions.

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run build` - Build frontend for production
- `npm run db:push` - Push database schema

## Admin Access

Default admin credentials need to be created after deployment.

## Support

Contact support for deployment assistance.