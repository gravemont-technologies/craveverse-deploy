# CraveVerse Setup Script for PowerShell
# This script helps set up the development environment

Write-Host "🚀 Setting up CraveVerse..." -ForegroundColor Blue
Write-Host ""

# Function to print colored output
function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Success "Node.js $nodeVersion is installed"
} catch {
    Write-Error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Success "npm $npmVersion is installed"
} catch {
    Write-Error "npm is not installed. Please install npm."
    exit 1
}

# Create necessary directories
Write-Status "Creating necessary directories..."
$directories = @(
    "public\images",
    "public\icons",
    "src\components\ui",
    "src\lib",
    "src\hooks",
    "database",
    "scripts"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Success "Directories created successfully"

# Install dependencies
Write-Status "Installing dependencies..."
if (Test-Path "package-lock.json") {
    npm ci
} else {
    npm install
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}
Write-Success "Dependencies installed successfully"

# Check environment file
if (Test-Path ".env") {
    Write-Success ".env file found with existing configuration"
    Write-Status "Please verify your environment variables are correct"
} else {
    Write-Warning ".env file not found"
    Write-Status "Please create a .env file with your configuration"
}

# Run initial build
Write-Status "Running initial build..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed. Please check the errors above"
    exit 1
}
Write-Success "Build completed successfully"

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update .env.local with your actual values:" -ForegroundColor White
Write-Host "   - Supabase URL and keys" -ForegroundColor Gray
Write-Host "   - Clerk publishable and secret keys" -ForegroundColor Gray
Write-Host "   - PostHog key (optional)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Set up your Supabase database:" -ForegroundColor White
Write-Host "   - Create a new Supabase project" -ForegroundColor Gray
Write-Host "   - Run the SQL schema from database/schema.sql" -ForegroundColor Gray
Write-Host "   - Update your Supabase keys in .env.local" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Set up Clerk authentication:" -ForegroundColor White
Write-Host "   - Create a new Clerk application" -ForegroundColor Gray
Write-Host "   - Configure authentication providers" -ForegroundColor Gray
Write-Host "   - Update your Clerk keys in .env.local" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see the README.md file" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to continue"
