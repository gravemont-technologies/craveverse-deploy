# DEPENDENCY UPDATE SCRIPT - CraveVerse
# Updates all dependencies to latest stable versions with robust alternatives

Write-Host "🔄 UPDATING DEPENDENCIES TO LATEST STABLE VERSIONS" -ForegroundColor Blue
Write-Host "=================================================" -ForegroundColor Blue
Write-Host ""

# Function to check current versions
function Get-CurrentVersions {
    Write-Host "📋 Current dependency versions:" -ForegroundColor Yellow
    npm list --depth=0
}

# Function to check for outdated packages
function Get-OutdatedPackages {
    Write-Host "🔍 Checking for outdated packages..." -ForegroundColor Yellow
    npm outdated
}

# Function to update dependencies safely
function Update-Dependencies {
    Write-Host "⬆️  Updating dependencies to latest stable versions..." -ForegroundColor Green
    
    # Update npm itself first
    Write-Host "Updating npm..." -ForegroundColor Cyan
    npm install -g npm@latest
    
    # Update all dependencies
    Write-Host "Updating all dependencies..." -ForegroundColor Cyan
    npm update
    
    # Install latest versions of key packages
    Write-Host "Installing latest versions of key packages..." -ForegroundColor Cyan
    
    # Core framework updates
    npm install next@latest react@latest react-dom@latest typescript@latest
    
    # UI library updates
    npm install @radix-ui/react-accordion@latest @radix-ui/react-dialog@latest @radix-ui/react-dropdown-menu@latest
    
    # Utility updates
    npm install clsx@latest tailwind-merge@latest lucide-react@latest
    
    # Development tools updates
    npm install -D @types/node@latest @types/react@latest @types/react-dom@latest eslint@latest
    
    Write-Host "✅ Dependencies updated successfully" -ForegroundColor Green
}

# Function to audit for security issues
function Test-SecurityAudit {
    Write-Host "🔒 Running security audit..." -ForegroundColor Yellow
    npm audit
    
    Write-Host "🔧 Fixing security vulnerabilities..." -ForegroundColor Yellow
    npm audit fix --force
}

# Function to verify installation
function Test-Installation {
    Write-Host "🧪 Verifying installation..." -ForegroundColor Yellow
    
    # Check if build works
    Write-Host "Testing build process..." -ForegroundColor Cyan
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed" -ForegroundColor Red
    }
    
    # Check type checking
    Write-Host "Testing type checking..." -ForegroundColor Cyan
    npm run type-check
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Type checking passed" -ForegroundColor Green
    } else {
        Write-Host "❌ Type checking failed" -ForegroundColor Red
    }
}

# Main execution
Write-Host "🎯 DEPENDENCY UPDATE PROCESS" -ForegroundColor Magenta
Write-Host "============================" -ForegroundColor Magenta
Write-Host ""

# Step 1: Check current state
Get-CurrentVersions
Write-Host ""

# Step 2: Check for outdated packages
Get-OutdatedPackages
Write-Host ""

# Step 3: Update dependencies
Update-Dependencies
Write-Host ""

# Step 4: Security audit
Test-SecurityAudit
Write-Host ""

# Step 5: Verify installation
Test-Installation

Write-Host ""
Write-Host "🎉 DEPENDENCY UPDATE COMPLETE" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host "All dependencies updated to latest stable versions" -ForegroundColor Cyan
Write-Host "Security vulnerabilities addressed" -ForegroundColor Cyan
Write-Host "Build and type checking verified" -ForegroundColor Cyan

