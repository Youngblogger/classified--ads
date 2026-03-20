@echo off
echo Starting Classified Ads Application...
echo.

echo Starting Backend (Laravel)...
start "Backend" cmd /k "cd /d %~dp0backend && php artisan serve --port=8000"

timeout /t 3 /nobreak >nul

echo Starting Frontend (Next.js)...
start "Frontend" cmd /k "npm run dev:simple"

timeout /t 3 /nobreak >nul

echo Starting Socket Server...
start "Socket" cmd /k "node socket-server.js"

echo.
echo All services started!
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:8000
echo - Socket:   http://localhost:3001
echo.
echo Press any key to exit...
pause >nul