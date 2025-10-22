@echo off
echo 🚀 SINGLE SERVER START - CraveVerse
echo ====================================
echo.

echo 🔧 Step 1: Eliminating all conflicts...
call npm run stop-all-bat
echo.

echo 🧹 Step 2: Verifying clean environment...
netstat -ano | findstr :5173
if %errorlevel% equ 0 (
    echo ⚠️  Port 5173 still in use - forcing cleanup...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
        taskkill /F /PID %%a 2>nul
    )
    timeout /t 2 /nobreak >nul
)

echo.
echo ✅ Environment is clean
echo.

echo 🚀 Step 3: Starting single CraveVerse server...
echo    Server will run on: http://localhost:5173
echo    Press Ctrl+C to stop the server
echo.

npm run dev

echo.
echo 🛑 Server stopped
echo.
pause

