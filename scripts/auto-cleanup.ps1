# Auto-cleanup script to prevent Vite conflicts
# This script monitors for Vite processes and cleans them automatically

Write-Host "🔍 Monitoring for Vite conflicts..." -ForegroundColor Green

# Function to check for Vite processes
function Check-ViteProcesses {
    $viteProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*vite*" -or $_.CommandLine -like "*src/App.tsx*"
    }
    return $viteProcesses
}

# Function to clean up Vite processes
function Clean-ViteProcesses {
    Write-Host "🧹 Cleaning up Vite processes..." -ForegroundColor Yellow
    
    # Kill all Node.js processes that might be Vite
    Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            Write-Host "Killed process PID: $($_.Id)" -ForegroundColor Red
            Stop-Process -Id $_.Id -Force
        } catch {
            Write-Host "Could not kill process PID: $($_.Id)" -ForegroundColor Red
        }
    }
    
    Write-Host "✅ Cleanup complete!" -ForegroundColor Green
}

# Main monitoring loop
while ($true) {
    $viteProcesses = Check-ViteProcesses
    
    if ($viteProcesses.Count -gt 0) {
        Write-Host "⚠️  Vite conflicts detected! Cleaning up..." -ForegroundColor Red
        Clean-ViteProcesses
        Start-Sleep -Seconds 2
    } else {
        Write-Host "✅ No Vite conflicts detected" -ForegroundColor Green
    }
    
    Start-Sleep -Seconds 10
}
