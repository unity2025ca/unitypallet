module.exports = {
  apps: [{
    name: 'jaberco-ecommerce',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    node_args: '--max-old-space-size=2048',
    restart_delay: 1000,
    min_uptime: '10s',
    max_restarts: 10,
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true
  }]
};