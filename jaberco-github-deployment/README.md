# Jaberco E-commerce Platform

Advanced Arabic e-commerce platform specializing in Amazon return pallets and liquidation inventory, providing a comprehensive marketplace solution with intelligent customer experience and robust data management.

## Features

### Core Platform
- **Multilingual Support**: Complete Arabic and English localization
- **Product Management**: Advanced catalog with image management via Cloudinary
- **Shopping Experience**: Cart, checkout, and order management
- **Payment Processing**: Secure Stripe integration
- **User Authentication**: Customer and admin role-based access

### Advanced Features
- **Admin Dashboard**: Comprehensive management panel
- **Publisher Access**: Content management permissions
- **Automated Backups**: Scheduled database backups
- **SMS Notifications**: Twilio integration for order updates
- **Email System**: SendGrid for customer communications
- **Analytics**: Visitor tracking and business insights

### Technical Stack
- **Frontend**: React.js with TypeScript and Shadcn UI
- **Backend**: Express.js with advanced authentication
- **Database**: PostgreSQL with Drizzle ORM
- **Cloud Services**: Cloudinary, Stripe, Twilio, SendGrid
- **Security**: Comprehensive middleware and brute force protection

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- AWS account (for Parameter Store)

### Installation
```bash
git clone [repository-url]
cd jaberco-github-deployment
npm install
```

### Configuration
1. Set up AWS Parameter Store (see `AWS_PARAMETER_STORE_SETUP.md`)
2. Configure environment variables
3. Build and deploy

### Deployment
```bash
npm run build
pm2 start ecosystem.config.js --env production
```

## Documentation
- `DEPLOYMENT_INSTRUCTIONS.md` - Complete deployment guide
- `AWS_PARAMETER_STORE_SETUP.md` - AWS secrets management
- `.env.example` - Environment variables reference

## Architecture
- Modern React frontend with TypeScript
- Express.js REST API backend
- PostgreSQL with Drizzle ORM
- AWS Parameter Store for secrets
- PM2 for process management

## Security
- All sensitive data managed via AWS Parameter Store
- Security headers and CORS protection
- Brute force protection
- Role-based access control

## License
Proprietary - Jaberco E-commerce Platform