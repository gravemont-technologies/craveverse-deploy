@echo off
REM CraveVerse Setup Script for Windows
REM This script helps set up the development environment

echo 🚀 Setting up CraveVerse...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [SUCCESS] Node.js is installed
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo [SUCCESS] npm is installed
npm --version

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist "public\images" mkdir "public\images"
if not exist "public\icons" mkdir "public\icons"
if not exist "src\components\ui" mkdir "src\components\ui"
if not exist "src\lib" mkdir "src\lib"
if not exist "src\hooks" mkdir "src\hooks"
if not exist "database" mkdir "database"
if not exist "scripts" mkdir "scripts"
echo [SUCCESS] Directories created successfully

REM Install dependencies
echo [INFO] Installing dependencies...
if exist "package-lock.json" (
    npm ci
) else (
    npm install
)
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully

REM Check environment file
if exist ".env" (
    echo [SUCCESS] .env file found with existing configuration
    echo [INFO] Please verify your environment variables are correct
) else (
    echo [WARNING] .env file not found
    echo [INFO] Please create a .env file with your configuration
)

REM Run initial build
echo [INFO] Running initial build...
npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed. Please check the errors above
    pause
    exit /b 1
)
echo [SUCCESS] Build completed successfully

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Update .env.local with your actual values:
echo    - Supabase URL and keys
echo    - Clerk publishable and secret keys
echo    - PostHog key (optional)
echo.
echo 2. Set up your Supabase database:
echo    - Create a new Supabase project
echo    - Run the SQL schema from database/schema.sql
echo    - Update your Supabase keys in .env.local
echo.
echo 3. Set up Clerk authentication:
echo    - Create a new Clerk application
echo    - Configure authentication providers
echo    - Update your Clerk keys in .env.local
echo.
echo 4. Start the development server:
echo    npm run dev
echo.
echo 5. Open http://localhost:3000 in your browser
echo.
echo For more information, see the README.md file
echo.
pause
