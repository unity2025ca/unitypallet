#!/usr/bin/env node

// Production starter script for Replit deployment
// This script handles the production deployment properly

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Jaberco E-commerce in Production Mode');

// Check if we're in Replit environment
const isReplit = process.env.REPLIT_DB_URL !== undefined || 
                 process.env.REPLIT_DOMAINS !== undefined ||
                 process.env.REPLIT_ENVIRONMENT !== undefined;

console.log('Environment detected:', isReplit ? 'Replit' : 'Standard');

// Check if dist directory exists
const distExists = fs.existsSync(path.join(__dirname, 'dist'));
console.log('Built files exist:', distExists);

// For Replit, always use development mode to avoid serving issues
if (isReplit) {
  console.log('🔧 Running in Replit-compatible mode (development server)');
  
  // Set environment variables for Replit
  process.env.NODE_ENV = 'development';
  process.env.PORT = process.env.PORT || '5000';
  
  // Start the development server
  const child = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });
  
  child.on('exit', (code) => {
    console.log(`Development server exited with code ${code}`);
    process.exit(code);
  });
  
} else {
  // For standard production deployments
  console.log('🏭 Running in standard production mode');
  
  if (!distExists) {
    console.log('📦 Building project first...');
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit'
    });
    
    buildProcess.on('exit', (buildCode) => {
      if (buildCode === 0) {
        console.log('✅ Build completed successfully');
        startProductionServer();
      } else {
        console.error('❌ Build failed');
        process.exit(1);
      }
    });
  } else {
    startProductionServer();
  }
}

function startProductionServer() {
  console.log('🚀 Starting production server...');
  
  // Set production environment
  process.env.NODE_ENV = 'production';
  
  // Start the production server
  const child = spawn('node', ['dist/index.js'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });
  
  child.on('exit', (code) => {
    console.log(`Production server exited with code ${code}`);
    process.exit(code);
  });
}

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});