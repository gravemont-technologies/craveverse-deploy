# SIMPLE PERMANENT CLEANUP - CraveVerse
Write-Host "🔧 PERMANENT CLEANUP SYSTEM" -ForegroundColor Blue

# Kill all Node.js processes
Write-Host "🔥 Eliminating all conflicts..." -ForegroundColor Red
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Killing PID: $($_.Id)" -ForegroundColor Red
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# Wait for processes to terminate
Start-Sleep -Seconds 2

# Verify clean environment
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses.Count -eq 0) {
    Write-Host "✅ Environment is clean" -ForegroundColor Green
    Write-Host "🚀 Starting single server..." -ForegroundColor Green
    npm run dev
} else {
    Write-Host "❌ Still have $($nodeProcesses.Count) Node.js processes" -ForegroundColor Red
}

