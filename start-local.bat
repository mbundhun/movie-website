@echo off
REM Batch script to start both backend and frontend locally
REM Usage: start-local.bat

echo Starting Movie Website Development Servers...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo Starting Backend Server...
echo Backend will run on http://localhost:5000
echo.

REM Start backend in new window
start "Backend Server" cmd /k "cd backend && if not exist node_modules (npm install) && npm start"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Server...
echo Frontend will run on http://localhost:3000
echo.

REM Start frontend in new window
start "Frontend Server" cmd /k "cd frontend && if not exist node_modules (npm install) && npm start"

echo.
echo Servers are starting in separate windows...
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Note: Frontend will automatically open in your browser
echo Press Ctrl+C in each window to stop the servers
echo.
pause

