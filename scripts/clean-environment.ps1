# CraveVerse Environment Cleanup Script
# This script kills any conflicting Vite servers and ensures only our Next.js server runs

Write-Host "🧹 Cleaning development environment..." -ForegroundColor Cyan

# Kill all Node.js processes except our Next.js server
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js processes" -ForegroundColor Yellow
    
    foreach ($process in $nodeProcesses) {
        try {
            $commandLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($process.Id)").CommandLine
            if ($commandLine -and $commandLine -like "*next dev*") {
                Write-Host "Keeping Next.js server (PID: $($process.Id))" -ForegroundColor Green
            } else {
                Write-Host "Killing conflicting process (PID: $($process.Id))" -ForegroundColor Red
                Stop-Process -Id $process.Id -Force
            }
        }
        catch {
            Write-Host "Could not determine process type for PID: $($process.Id)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "No Node.js processes found" -ForegroundColor Green
}

# Check if our Next.js server is running
$nextjsProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $commandLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
    $commandLine -and $commandLine -like "*next dev*"
}

if ($nextjsProcess) {
    Write-Host "✅ Next.js server is running (PID: $($nextjsProcess.Id))" -ForegroundColor Green
    Write-Host "🌐 Application available at: http://localhost:5173" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Next.js server not running. Start it with: npm run dev" -ForegroundColor Yellow
}

Write-Host "✨ Environment cleanup complete!" -ForegroundColor Cyan
