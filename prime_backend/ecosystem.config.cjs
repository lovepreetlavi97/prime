module.exports = {
  apps: [
    {
      name: 'prime-backend-api',
      script: 'index.js',
      instances: 1, // 🔥 Singleton: Prevent duplicate Telegram/Angel connections
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'prime-ingestion-worker',
      script: 'src/loaders/queue.js',
      instances: 1, // Workers should usually not be clustered unless state is external
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
