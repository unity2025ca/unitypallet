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

## Environment Variables

Create `.env` file with:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/jaberco_db
SESSION_SECRET=your-super-secret-session-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-phone-number
SENDGRID_API_KEY=your-sendgrid-key
NODE_ENV=production
PORT=3000
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run build` - Build frontend for production
- `npm run db:push` - Push database schema

## Admin Access

Default admin credentials need to be created after deployment.

## Support

Contact support for deployment assistance.