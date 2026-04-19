@echo off
cd "C:\Users\USER\OneDrive\Desktop\Classified ads"
start /B node node_modules\next\dist\bin\next start -p 3000 > next-server.log 2>&1
ping -n 5 127.0.0.1 >nul
netstat -ano | findstr ":3000"