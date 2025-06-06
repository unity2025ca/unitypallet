#!/bin/bash

echo "🚀 Jaberco E-commerce GitHub Deployment Script"
echo "==============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Environment file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your actual configuration values"
    echo ""
    echo "Required secrets for Jaberco E-commerce Platform:"
    echo "- DATABASE_URL: PostgreSQL connection string"
    echo "- SESSION_SECRET: Strong random string for security"
    echo "- CLOUDINARY_*: Image management service keys"
    echo "- STRIPE_*: Payment processing keys"
    echo "- TWILIO_*: SMS notification credentials"
    echo "- SENDGRID_API_KEY: Email service key"
    echo ""
    echo "See SECRETS_SETUP_GUIDE.md for detailed instructions"
    read -p "Press Enter after configuring .env file..."
fi

# Validate critical environment variables
echo "🔍 Validating environment configuration..."

# Load .env if it exists (for non-AWS deployments)
if [ -f ".env" ]; then
    source .env
fi

# Check if AWS Parameter Store will be used
if [ -n "$AWS_ACCESS_KEY_ID" ] || [ -n "$AWS_PROFILE" ] || [ -n "$AWS_REGION" ]; then
    echo "✅ AWS Parameter Store configuration detected - secrets will be loaded at runtime"
else
    # Validate environment variables for non-AWS deployments
    if [ -z "$DATABASE_URL" ] || [[ "$DATABASE_URL" == *"username:password"* ]]; then
        echo "❌ DATABASE_URL not properly configured"
        exit 1
    fi

    if [ -z "$SESSION_SECRET" ] || [[ "$SESSION_SECRET" == *"your-super-secret"* ]]; then
        echo "❌ SESSION_SECRET not properly configured"
        exit 1
    fi

    if [ -z "$CLOUDINARY_CLOUD_NAME" ] || [[ "$CLOUDINARY_CLOUD_NAME" == *"your-cloud-name"* ]]; then
        echo "❌ Cloudinary configuration not properly set"
        exit 1
    fi

    if [ -z "$STRIPE_SECRET_KEY" ] || [[ "$STRIPE_SECRET_KEY" == *"your_secret_key"* ]]; then
        echo "❌ Stripe configuration not properly set"
        exit 1
    fi
fi

echo "✅ Environment configuration validated"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build application
echo "🏗️  Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build application"
    exit 1
fi

# Create logs directory
mkdir -p logs

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.cjs

if [ $? -eq 0 ]; then
    echo "✅ PM2 started successfully"
    # Save PM2 configuration
    pm2 save
else
    echo "⚠️  PM2 failed, starting manually..."
    echo "🚀 Starting application directly..."
    nohup node dist/index.js > logs/app.log 2>&1 &
    echo $! > logs/app.pid
    echo "✅ Application started manually"
    echo "📝 Check logs: tail -f logs/app.log"
fi

# Setup PM2 startup
pm2 startup

echo "✅ Deployment completed successfully!"
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs jaberco-app"
echo "🌐 Application running on port 5000"