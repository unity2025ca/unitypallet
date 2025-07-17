#!/usr/bin/env node

// Production startup script with better error handling
const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('Starting Jaberco E-commerce Server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);

// Start the server
const serverProcess = spawn('node', [
  'dist/index.js'
], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env
});

// Handle server process events
serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`Server process exited with code ${code} and signal ${signal}`);
    process.exit(1);
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  serverProcess.kill('SIGINT');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception in startup script:', error);
  serverProcess.kill('SIGTERM');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection in startup script:', promise, 'reason:', reason);
  serverProcess.kill('SIGTERM');
  process.exit(1);
});