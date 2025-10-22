# CONFLICT PREVENTION SYSTEM - CraveVerse
# This script monitors and prevents Vite conflicts automatically

Write-Host "🛡️  CONFLICT PREVENTION SYSTEM - CraveVerse" -ForegroundColor Blue
Write-Host "=============================================" -ForegroundColor Blue
Write-Host ""

# Function to monitor for conflicts
function Watch-ForConflicts {
    Write-Host "👁️  Monitoring for conflicts..." -ForegroundColor Yellow
    
    while ($true) {
        # Check for Node.js processes
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        
        if ($nodeProcesses.Count -gt 1) {
            Write-Host "⚠️  CONFLICT DETECTED: Multiple Node.js processes running!" -ForegroundColor Red
            Write-Host "   Found $($nodeProcesses.Count) processes:" -ForegroundColor Red
            
            foreach ($process in $nodeProcesses) {
                Write-Host "   PID: $($process.Id) - $($process.ProcessName)" -ForegroundColor Red
            }
            
            Write-Host ""
            Write-Host "🔧 Auto-resolving conflicts..." -ForegroundColor Yellow
            
            # Kill all but the first process (assuming it's our main server)
            $processesToKill = $nodeProcesses | Select-Object -Skip 1
            foreach ($process in $processesToKill) {
                try {
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                    Write-Host "   ✅ Killed conflicting process PID: $($process.Id)" -ForegroundColor Green
                } catch {
                    Write-Host "   ❌ Could not kill process PID: $($process.Id)" -ForegroundColor Red
                }
            }
            
            Write-Host "✅ Conflicts resolved automatically" -ForegroundColor Green
        }
        
        # Check for port conflicts
        $ports = @(3000, 3001, 3002, 5173, 5174, 8080, 8081)
        foreach ($port in $ports) {
            $listening = netstat -ano | findstr ":$port"
            if ($listening) {
                $lines = $listening -split "`n"
                if ($lines.Count -gt 1) {
                    Write-Host "⚠️  PORT CONFLICT: Multiple processes on port $port" -ForegroundColor Red
                    Write-Host "🔧 Auto-resolving port conflicts..." -ForegroundColor Yellow
                    
                    # Kill processes on conflicting ports
                    foreach ($line in $lines) {
                        if ($line -match "(\d+)$") {
                            $pid = $matches[1]
                            try {
                                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                                Write-Host "   ✅ Killed process on port $port (PID: $pid)" -ForegroundColor Green
                            } catch {
                                Write-Host "   ❌ Could not kill process on port $port (PID: $pid)" -ForegroundColor Red
                            }
                        }
                    }
                }
            }
        }
        
        # Wait before next check
        Start-Sleep -Seconds 5
    }
}

# Function to start prevention system
function Start-ConflictPrevention {
    Write-Host "🚀 Starting conflict prevention system..." -ForegroundColor Green
    Write-Host "   This will monitor for conflicts and auto-resolve them" -ForegroundColor Cyan
    Write-Host "   Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
    Write-Host ""
    
    try {
        Watch-ForConflicts
    } catch {
        Write-Host "🛑 Conflict prevention system stopped" -ForegroundColor Yellow
    }
}

# Main execution
Write-Host "🎯 CONFLICT PREVENTION SYSTEM" -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Magenta
Write-Host ""

Start-ConflictPrevention
