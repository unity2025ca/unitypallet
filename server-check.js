// script to check server status
const http = require('http');
const fs = require('fs');
const path = require('path');

// Log directory
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logPath = path.join(logDir, 'server-check.log');
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logPath, logMessage);
  console.log(message);
};

// Get port from environment or use default
const port = process.env.PORT || 3000;

log('Checking server status...');

// Try to connect to the server
const req = http.get(`http://localhost:${port}/api/settings`, (res) => {
  log(`Server responded with status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      log('Response received successfully');
      if (res.statusCode === 200) {
        log('Server is running correctly');
      } else {
        log(`Server responded with non-200 status: ${res.statusCode}`);
        log(`Response: ${data}`);
      }
    } catch (e) {
      log(`Error parsing response: ${e.message}`);
    }
  });
}).on('error', (e) => {
  log(`Error connecting to server: ${e.message}`);
  log('Make sure the server is running and the port is correct');
});

req.setTimeout(5000, () => {
  log('Request timed out after 5 seconds');
  req.abort();
});