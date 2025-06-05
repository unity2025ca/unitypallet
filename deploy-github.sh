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
    echo "   Required: DATABASE_URL, SESSION_SECRET, and API keys"
    read -p "Press Enter after configuring .env file..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build frontend
echo "🏗️  Building frontend..."
npm run build:frontend

if [ $? -ne 0 ]; then
    echo "❌ Failed to build frontend"
    exit 1
fi

# Create logs directory
mkdir -p logs

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup

echo "✅ Deployment completed successfully!"
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs jaberco-ecommerce"
echo "🌐 Application running on port 3000"