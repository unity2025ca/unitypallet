#!/bin/bash

echo "🚀 Jaberco E-commerce WSA Deployment Script"
echo "==========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

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

# Check if dist directory was created
if [ ! -d "dist" ]; then
    echo "❌ Build output directory 'dist' not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Start the application
echo "🚀 Starting Jaberco E-commerce server..."
echo "   The application will be available at http://localhost:3000"
echo "   Press Ctrl+C to stop the server"

npm start