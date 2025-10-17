@echo off
echo Setting up environment configuration...

if exist .env.local (
    echo .env.local already exists
    echo.
    echo Current configuration:
    type .env.local | findstr "CLERK"
    echo.
    echo To update your configuration, edit .env.local manually
) else (
    echo Creating .env.local from template...
    copy env.example .env.local
    echo.
    echo ✅ .env.local created successfully!
    echo.
    echo Next steps:
    echo 1. Edit .env.local with your actual API keys
    echo 2. Restart your development server: npm run dev
    echo.
    echo For Clerk setup, visit: https://dashboard.clerk.com
)

echo.
pause
