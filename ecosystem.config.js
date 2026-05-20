module.exports = {
  apps: [
    {
      name: 'socket-server',
      script: 'socket-server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '200M',
      restart_delay: 1000,
      max_restarts: 10,
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'development',
        SOCKET_PORT: 3006,
      },
    },
  ],
};
