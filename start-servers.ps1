$cwd = "C:\Users\USER\OneDrive\Desktop\Classified ads"
Set-Location $cwd

# Kill existing processes on required ports
Get-NetTCPConnection -LocalPort 3000,3006 -ErrorAction SilentlyContinue | Select-Object -Unique -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2

# Start Socket.IO server on port 3006
$socketLog = "$cwd\socket-out.log"
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "socket-server.js" -WorkingDirectory $cwd -RedirectStandardOutput $socketLog -RedirectStandardError "$cwd\socket-err.log"

Start-Sleep -Seconds 1

# Start Next.js on port 3000
$nextLog = "$cwd\next-server-out.log"
Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c npm run dev:simple > `"$nextLog`" 2>&1" -WorkingDirectory $cwd

Write-Host "Servers starting..."
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Socket:   http://localhost:3006"
