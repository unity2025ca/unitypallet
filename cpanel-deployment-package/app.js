#!/usr/bin/env node

/**
 * Jaberco E-commerce Platform
 * cPanel Production Server
 */

require('dotenv').config();

const path = require('path');
const express = require('express');

// Set environment to production if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Import the main application
const { createApp } = require('./dist/index.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up the application
createApp(app);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch all handler for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Jaberco E-commerce Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Database: Connected`);
  console.log(`💳 Stripe: Configured`);
  console.log(`📱 Twilio: Configured`);
  console.log(`☁️  Cloudinary: Configured`);
  console.log(`📧 SendGrid: Configured`);
  console.log(`🎯 Admin Panel: https://your-domain.com/admin`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

module.exports = app;