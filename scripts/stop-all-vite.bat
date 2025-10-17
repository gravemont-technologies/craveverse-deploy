@echo off
echo 🔥 Stopping all Vite servers and conflicting Node.js processes...
echo.

REM Kill all Node.js processes
echo Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul

echo.
echo ✅ All Node.js processes terminated
echo.
echo 🚀 You can now run: npm run dev
echo.
pause
