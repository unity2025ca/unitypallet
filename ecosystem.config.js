module.exports = {
  apps: [
    {
      name: "jaberco",
      script: "./dist/index.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000  // Este puerto debe coincidir con el que configuraste en cPanel
      }
    }
  ]
};