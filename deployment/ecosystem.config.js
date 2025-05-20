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
        PORT: 3000  // تأكد من توافق هذا المنفذ مع إعدادات cPanel
      },
      // إضافة إعدادات السجلات لتسهيل استكشاف الأخطاء وإصلاحها
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      // إعدادات إضافية مفيدة
      max_memory_restart: "250M",
      restart_delay: 4000,
      wait_ready: true,
      listen_timeout: 50000,
      kill_timeout: 5000
    }
  ]
};