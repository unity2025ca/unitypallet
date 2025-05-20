// Script para iniciar la aplicación en cPanel
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Crear archivos de logs
const out = fs.openSync(path.join(logsDir, 'out.log'), 'a');
const err = fs.openSync(path.join(logsDir, 'error.log'), 'a');

// Iniciar la aplicación usando PM2
console.log('Iniciando aplicación con PM2...');
const pm2 = spawn('npx', ['pm2', 'start', 'ecosystem.config.js'], {
  detached: true,
  stdio: ['ignore', out, err]
});

pm2.unref();
console.log('Aplicación iniciada. Ver logs en ./logs/out.log y ./logs/error.log');