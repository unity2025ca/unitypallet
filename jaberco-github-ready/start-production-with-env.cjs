#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting Jaberco E-commerce with Environment Loading');
console.log('====================================================');

// Function to load .env file
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found. Please create it first.');
    process.exit(1);
  }

  console.log('📄 Loading environment variables from .env...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  let loadedCount = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        process.env[key] = value;
        loadedCount++;
        console.log(`✅ ${key}=${value.substring(0, 20)}...`);
      }
    }
  }
  
  console.log(`📊 Loaded ${loadedCount} environment variables`);
}

// Load environment variables first
loadEnvFile();

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log(`📦 Environment: ${process.env.NODE_ENV}`);
console.log(`🌐 Port: ${process.env.PORT}`);
console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);

// Check if built files exist
const distPath = path.join(__dirname, 'dist', 'index.js');
if (!fs.existsSync(distPath)) {
  console.error('❌ Built files not found. Please run npm run build first.');
  process.exit(1);
}

console.log('🚀 Starting application...');

// Start the application using the built file
const child = spawn('node', ['dist/index.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: process.env
});

child.on('error', (error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Application exited with code ${code}`);
    process.exit(code);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  child.kill('SIGINT');
});