#!/bin/bash

# Jaberco E-commerce Deployment Script
# This script handles the complete deployment process

echo "🚀 Starting Jaberco E-commerce Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

# Stop existing application if running
print_status "Stopping existing application..."
pm2 stop jaberco-ecommerce 2>/dev/null || true
pm2 delete jaberco-ecommerce 2>/dev/null || true

# Clean old build files
print_status "Cleaning previous build..."
rm -rf dist/
rm -rf node_modules/.cache/

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build the application
print_status "Building application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed. Please check the error messages above."
    exit 1
fi

# Create logs directory
mkdir -p logs

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating template..."
    cat > .env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/database
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SENDGRID_API_KEY=your_sendgrid_api_key
EOF
    print_warning "Please update the .env file with your actual credentials before continuing."
    print_warning "Press Enter to continue once you've updated .env..."
    read
fi

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js

# Check if application started successfully
sleep 5
if pm2 list | grep -q "jaberco-ecommerce.*online"; then
    print_status "✅ Application started successfully!"
    print_status "📊 Application Status:"
    pm2 show jaberco-ecommerce
    echo ""
    print_status "🌐 Application should be accessible at:"
    print_status "   - http://localhost:5000"
    print_status "   - http://your-server-ip:5000"
    echo ""
    print_status "📋 Useful commands:"
    print_status "   - View logs: pm2 logs jaberco-ecommerce"
    print_status "   - Monitor: pm2 monit"
    print_status "   - Restart: pm2 restart jaberco-ecommerce"
    print_status "   - Stop: pm2 stop jaberco-ecommerce"
else
    print_error "❌ Application failed to start. Check logs:"
    pm2 logs jaberco-ecommerce --lines 20
    exit 1
fi

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save
pm2 startup

echo ""
print_status "🎉 Deployment completed successfully!"
print_status "📖 For troubleshooting, check DEPLOYMENT_TROUBLESHOOTING.md"