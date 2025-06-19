#!/bin/bash

# Jaberco E-commerce - cPanel Installation Script
# Run this script after uploading files to your cPanel hosting

echo "🚀 Installing Jaberco E-commerce Platform..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ through cPanel."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create it from .env.example"
    echo "📋 Copy .env.example to .env and fill in your configuration"
    cp .env.example .env
    echo "🔧 Please edit .env file with your database and API credentials"
    exit 1
fi

# Test database connection
echo "🔌 Testing database connection..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT 1 as test')
  .then(() => {
    console.log('✅ Database connection successful');
    pool.end();
  })
  .catch(err => {
    console.log('❌ Database connection failed:', err.message);
    pool.end();
    process.exit(1);
  });
"

# Import database if backup exists
if [ -f "jaberco_complete_database.sql" ]; then
    echo "📊 Importing database..."
    # Extract database info from DATABASE_URL
    DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2)
    if [ ! -z "$DB_URL" ]; then
        echo "🔄 Importing complete database with all data..."
        psql "$DB_URL" < jaberco_complete_database.sql
        echo "✅ Database imported successfully"
    fi
fi

# Set proper permissions
echo "🔒 Setting file permissions..."
chmod +x app.js
chmod 644 .htaccess
chmod 600 .env

echo "🎉 Installation completed successfully!"
echo ""
echo "🌐 Your Jaberco E-commerce site is ready to launch"
echo "📱 Admin Panel: https://your-domain.com/admin"
echo "🔑 Default Admin: admin@jaberco.com / admin123"
echo ""
echo "⚠️  Important: Change admin password immediately after first login"
echo "🔐 Configure all API keys in your .env file"
echo ""
echo "📞 Support: support@jaberco.com"