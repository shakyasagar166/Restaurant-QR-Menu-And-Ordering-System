@echo off
title Bikaner Express - Restaurant Server Launcher
color 0A
echo ========================================================
echo   BIKANER EXPRESS FOODS - 1-CLICK SYSTEM STARTER
echo ========================================================
echo.
echo [1/3] Checking MySQL Service...
net start MySQL80 >nul 2>&1
echo [OK] MySQL is active.
echo.
echo [2/3] Starting Spring Boot Backend (Port 8080)...
start "Bikaner Express Backend :8080" cmd /k "cd /d C:\Users\Asus\.gemini\antigravity\scratch\bikaner-express\backend && C:\Users\Asus\Downloads\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd spring-boot:run"
echo.
echo [3/3] Starting Vite Frontend (Port 3000)...
start "Bikaner Express Frontend :3000" cmd /k "cd /d C:\Users\Asus\.gemini\antigravity\scratch\bikaner-express\frontend && npm run dev -- --port 3000 --host"
echo.
echo ========================================================
echo   ALL SERVICES STARTED SUCCESSFULLY!
echo   Website:  http://localhost:3000
echo   Admin:    http://localhost:3000/admin (PIN: 9058 / 1234)
echo ========================================================
timeout /t 5
