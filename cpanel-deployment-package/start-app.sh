#!/bin/bash

echo "🚀 Starting Jaberco E-commerce Application"
echo "========================================"

# Set environment variables
export NODE_ENV=production
export PORT=5000

# Create logs directory
mkdir -p logs

# Check if application is already running
if [ -f logs/app.pid ]; then
    PID=$(cat logs/app.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Application is already running (PID: $PID)"
        echo "🛑 Stopping existing process..."
        kill $PID
        sleep 2
    fi
    rm -f logs/app.pid
fi

# Start the application
echo "🚀 Starting application on port 5000..."
echo "📅 Started at: $(date)"

# Try PM2 first
if command -v pm2 &> /dev/null; then
    echo "📦 Using PM2..."
    pm2 stop jaberco-app 2>/dev/null || true
    pm2 delete jaberco-app 2>/dev/null || true
    pm2 start ecosystem.config.cjs
    
    if [ $? -eq 0 ]; then
        echo "✅ Application started with PM2"
        echo "📊 Status: pm2 status"
        echo "📝 Logs: pm2 logs jaberco-app"
        exit 0
    fi
fi

# Fallback to direct execution with environment loading
echo "📝 Starting directly with Node.js and environment loading..."
nohup node start-production-with-env.cjs > logs/app.log 2>&1 &
APP_PID=$!
echo $APP_PID > logs/app.pid

# Wait a moment and check if process started
sleep 3
if ps -p $APP_PID > /dev/null 2>&1; then
    echo "✅ Application started successfully (PID: $APP_PID)"
    echo "📝 View logs: tail -f logs/app.log"
    echo "🌐 Application running on: http://localhost:5000"
    echo "🌍 External access: http://18.191.29.154:5000"
    echo ""
    echo "🔧 Management commands:"
    echo "   Stop: kill $APP_PID"
    echo "   Logs: tail -f logs/app.log"
    echo "   Status: ps -p $APP_PID"
else
    echo "❌ Failed to start application"
    echo "📝 Check logs: cat logs/app.log"
    exit 1
fi