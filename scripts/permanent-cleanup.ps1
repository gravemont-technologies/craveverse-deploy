# PERMANENT CLEANUP SYSTEM - CraveVerse
# This script provides a comprehensive solution to prevent Vite conflicts permanently

Write-Host "🔧 PERMANENT CLEANUP SYSTEM - CraveVerse" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host ""

# Function to check for conflicting processes
function Test-ConflictingProcesses {
    Write-Host "🔍 Scanning for conflicting processes..." -ForegroundColor Yellow
    
    # Check for Node.js processes
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses.Count -gt 0) {
        Write-Host "⚠️  Found $($nodeProcesses.Count) Node.js processes:" -ForegroundColor Red
        foreach ($process in $nodeProcesses) {
            Write-Host "   PID: $($process.Id) - $($process.ProcessName)" -ForegroundColor Red
        }
        return $true
    } else {
        Write-Host "✅ No conflicting Node.js processes found" -ForegroundColor Green
        return $false
    }
}

# Function to check for port conflicts
function Test-PortConflicts {
    Write-Host "🔍 Checking for port conflicts..." -ForegroundColor Yellow
    
    $ports = @(3000, 3001, 3002, 5173, 5174, 8080, 8081)
    $conflicts = @()
    
    foreach ($port in $ports) {
        $listening = netstat -ano | findstr ":$port"
        if ($listening) {
            $conflicts += $port
            Write-Host "⚠️  Port $port is in use" -ForegroundColor Red
        }
    }
    
    if ($conflicts.Count -gt 0) {
        Write-Host "❌ Port conflicts detected on: $($conflicts -join ', ')" -ForegroundColor Red
        return $true
    } else {
        Write-Host "✅ No port conflicts detected" -ForegroundColor Green
        return $false
    }
}

# Function to eliminate all conflicts
function Remove-AllConflicts {
    Write-Host "🔥 ELIMINATING ALL CONFLICTS..." -ForegroundColor Red
    Write-Host ""
    
    # Kill all Node.js processes
    Write-Host "Terminating all Node.js processes..." -ForegroundColor Yellow
    Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "   Killing PID: $($_.Id)" -ForegroundColor Red
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Host "   Could not kill PID: $($_.Id)" -ForegroundColor Red
        }
    }
    
    # Kill any remaining development servers
    $devProcesses = @("next", "vite", "webpack", "rollup")
    foreach ($process in $devProcesses) {
        Get-Process -Name $process -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "   Killing $process PID: $($_.Id)" -ForegroundColor Red
            try {
                Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            } catch {
                Write-Host "   Could not kill $process PID: $($_.Id)" -ForegroundColor Red
            }
        }
    }
    
    Write-Host ""
    Write-Host "✅ All conflicts eliminated" -ForegroundColor Green
}

# Function to verify clean environment
function Test-CleanEnvironment {
    Write-Host "🧹 Verifying clean environment..." -ForegroundColor Yellow
    
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses.Count -eq 0) {
        Write-Host "✅ Environment is clean - no Node.js processes running" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Environment still has $($nodeProcesses.Count) Node.js processes" -ForegroundColor Red
        return $false
    }
}

# Function to start single server
function Start-SingleServer {
    Write-Host "🚀 Starting single CraveVerse server..." -ForegroundColor Green
    Write-Host ""
    
    # Verify we're in the correct directory
    $currentDir = Get-Location
    Write-Host "Current directory: $currentDir" -ForegroundColor Cyan
    
    # Check if package.json exists
    if (!(Test-Path "package.json")) {
        Write-Host "❌ package.json not found. Please run this script from the project root." -ForegroundColor Red
        return $false
    }
    
    # Start the development server
    Write-Host "Starting Next.js development server..." -ForegroundColor Yellow
    Write-Host "Server will run on: http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
    
    # Start the server (this will run in background)
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru
    
    Write-Host "✅ CraveVerse server started successfully!" -ForegroundColor Green
    Write-Host "🌐 Access your application at: http://localhost:5173" -ForegroundColor Cyan
    return $true
}

# Main execution
Write-Host "🎯 PERMANENT CLEANUP SYSTEM EXECUTION" -ForegroundColor Magenta
Write-Host "=====================================" -ForegroundColor Magenta
Write-Host ""

# Step 1: Check for conflicts
$hasConflicts = Test-ConflictingProcesses
$hasPortConflicts = Test-PortConflicts

# Step 2: Eliminate conflicts if found
if ($hasConflicts -or $hasPortConflicts) {
    Remove-AllConflicts
    Start-Sleep -Seconds 2
}

# Step 3: Verify clean environment
$isClean = Test-CleanEnvironment

if ($isClean) {
    Write-Host ""
    Write-Host "🎉 ENVIRONMENT IS CLEAN - READY FOR SINGLE SERVER" -ForegroundColor Green
    Write-Host ""
    
    # Step 4: Start single server
    Start-SingleServer
} else {
    Write-Host ""
    Write-Host "❌ ENVIRONMENT STILL HAS CONFLICTS" -ForegroundColor Red
    Write-Host "Please run this script again or manually kill remaining processes" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 PERMANENT CLEANUP SYSTEM COMPLETE" -ForegroundColor Blue
Write-Host "=====================================" -ForegroundColor Blue
