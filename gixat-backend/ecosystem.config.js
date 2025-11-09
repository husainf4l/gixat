module.exports = {
  apps: [
    {
      name: 'gixat-backend',
      script: 'dist/src/main.js',
      cwd: '/Users/husain/Desktop/gixat/gixat-backend',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 4006
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 4006
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      merge_logs: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};