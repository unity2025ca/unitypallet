#!/bin/bash

echo "🚀 Jaberco E-commerce AWS Deployment Script"
echo "==============================================="

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production=false

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build application
echo "🏗️  Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Stop existing application if running
echo "🛑 Stopping existing application..."
pm2 stop jaberco-app 2>/dev/null || true
pm2 delete jaberco-app 2>/dev/null || true

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.cjs

if [ $? -eq 0 ]; then
    echo "✅ Application started successfully!"
    echo "📊 Check status: pm2 status"
    echo "📝 View logs: pm2 logs jaberco-app"
    echo "🌐 Application should be running on port 5000"
    echo ""
    echo "🔥 IMPORTANT: Make sure to:"
    echo "   1. Open port 5000 in AWS Security Group"
    echo "   2. Configure your .env file with all required secrets"
    echo "   3. Test the application: curl http://localhost:5000"
    echo ""
    echo "🌍 Access your site at: http://18.191.29.154:5000"
else
    echo "❌ Failed to start application with PM2"
    echo "🔧 Trying direct start for debugging..."
    NODE_ENV=production PORT=5000 node dist/index.js
fi