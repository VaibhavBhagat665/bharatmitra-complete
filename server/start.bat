@echo off
echo Starting Bharat Mitra Backend Services...

echo.
echo [1/2] Starting PDF Context API (Python - Port 5001)...
start "PDF API" cmd /k "cd /d %~dp0 && python pdf_api.py"

echo [2/2] Waiting 3 seconds for PDF API to start...
timeout /t 3 /nobreak > nul

echo [2/2] Starting Main Server (Node.js - Port 8080)...
start "Node Server" cmd /k "cd /d %~dp0 && node server.js"

echo.
echo ========================================
echo   Both servers starting!
echo   
echo   PDF API:    http://localhost:5001
echo   Main API:   http://localhost:8080
echo   Frontend:   Run 'npm run dev' separately
echo ========================================
