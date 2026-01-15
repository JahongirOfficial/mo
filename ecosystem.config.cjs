module.exports = {
  apps: [{
    name: 'mukammal-ota-ona',
    script: 'npx',
    args: 'tsx server/index.ts',
    cwd: '/var/www/mukammal-ota-ona',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
