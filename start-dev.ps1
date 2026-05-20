# Start socket server via PM2 (auto-restarts on crash)
npx pm2 start ecosystem.config.js --only socket-server 2>$null

# Wait for socket server to be ready
Start-Sleep 2

# Start Next.js dev server
npx next dev -p 3000
