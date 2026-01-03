# PowerShell script to start both backend and frontend locally
# Usage: .\start-local.ps1

Write-Host "Starting Movie Website Development Servers..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

# Check ports
if (Test-Port -Port 5000) {
    Write-Host "Warning: Port 5000 is already in use" -ForegroundColor Yellow
    Write-Host "Backend may already be running or another service is using port 5000" -ForegroundColor Yellow
}

if (Test-Port -Port 3000) {
    Write-Host "Warning: Port 3000 is already in use" -ForegroundColor Yellow
    Write-Host "Frontend may already be running or another service is using port 3000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Write-Host "Backend will run on http://localhost:5000" -ForegroundColor Gray

# Start backend in new window
$backendScript = @"
cd '$PSScriptRoot\backend'
if (Test-Path node_modules) {
    Write-Host 'Starting backend server...' -ForegroundColor Green
    npm start
} else {
    Write-Host 'Installing backend dependencies...' -ForegroundColor Yellow
    npm install
    Write-Host 'Starting backend server...' -ForegroundColor Green
    npm start
}
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# Wait a bit for backend to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
Write-Host "Frontend will run on http://localhost:3000" -ForegroundColor Gray
Write-Host ""

# Start frontend in new window
$frontendScript = @"
cd '$PSScriptRoot\frontend'
if (Test-Path node_modules) {
    Write-Host 'Starting frontend server...' -ForegroundColor Green
    npm start
} else {
    Write-Host 'Installing frontend dependencies...' -ForegroundColor Yellow
    npm install
    Write-Host 'Starting frontend server...' -ForegroundColor Green
    npm start
}
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

Write-Host ""
Write-Host "Servers are starting in separate windows..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Frontend will automatically open in your browser" -ForegroundColor Gray
Write-Host "Press Ctrl+C in each window to stop the servers" -ForegroundColor Gray

