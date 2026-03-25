@echo off
title iList - Starting Servers...

echo ========================================
echo    iList.ng - Starting All Servers
echo ========================================
echo.

:: Start Backend Server
echo [1/2] Starting Laravel Backend...
cd /d "%~dp0backend"
start "iList-Backend" cmd /k "title iList Backend && php artisan serve --host=0.0.0.0 --port=8000"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start Frontend Server
echo [2/2] Starting Next.js Frontend...
cd /d "%~dp0"
start "iList-Frontend" cmd /k "title iList Frontend && npm run dev"

echo.
echo ========================================
echo    Servers Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Admin Login:
echo   Email:    admin@ilist.com
echo   Password: admin123
echo.
echo Close this window to exit.
echo ========================================
pause
