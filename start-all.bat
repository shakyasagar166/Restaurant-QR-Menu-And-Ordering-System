@echo off
echo =======================================================
echo   🍲 Starting Bikaner Express Foods System
echo   100%% Pure Veg Restaurant - Rooftop Dine-In QR Menu
echo =======================================================

if "%GROQ_API_KEY%"=="" set GROQ_API_KEY=

echo Starting Spring Boot Backend on http://localhost:8080...
start "Bikaner Express Backend (Spring Boot)" cmd /k "cd backend && "C:\Users\Asus\Downloads\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd" spring-boot:run"

timeout /t 5 /nobreak >nul

echo Starting React Frontend on http://localhost:3000...
start "Bikaner Express Frontend (React)" cmd /k "cd frontend && npm run dev -- --port 3000 --host"

echo =======================================================
echo   ✅ Both servers started!
echo   Customer Menu: http://localhost:3000
echo   Table 4 QR URL: http://localhost:3000/?table=T-4
echo   Kitchen / Admin: http://localhost:3000 (Click 'Kitchen Bell' tab)
echo =======================================================
pause
