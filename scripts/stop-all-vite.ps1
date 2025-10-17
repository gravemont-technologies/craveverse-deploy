Write-Host "Stopping all Vite servers and conflicting Node.js processes..." -ForegroundColor Red
Write-Host ""

# Kill all Node.js processes
Write-Host "Killing all Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force
        Write-Host "Killed process PID: $($_.Id)" -ForegroundColor Green
    }
    catch {
        Write-Host "Could not kill process PID: $($_.Id)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "All Node.js processes terminated" -ForegroundColor Green
Write-Host ""
Write-Host "You can now run: npm run dev" -ForegroundColor Cyan
Write-Host ""
