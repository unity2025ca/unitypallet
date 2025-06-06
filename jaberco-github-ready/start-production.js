const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Jaberco E-commerce Platform in Production Mode');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = '5000';

// Start the application using tsx directly
const child = spawn('npx', ['tsx', 'server/index.ts'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: process.env
});

child.on('error', (error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Application process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nGracefully shutting down...');
  child.kill('SIGTERM');
});