module.exports = {
  apps: [
    {
      name: 'ilist-marketplace',
      script: 'node_modules/next/dist/bin/next',
      args: 'dev',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',
      restart_delay: 1000,
      max_restarts: 10,
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'ilist-production',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 1000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
