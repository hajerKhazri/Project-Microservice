@echo off
setlocal
title FreeLink ULTIMATE Starter
color 0B

echo ====================================================
echo     FreeLink - Ultimate Microservices Orchestrator
echo ====================================================
echo.

:: 1. Docker Infrastructure
echo [1/4] Starting Docker Infrastructure (Postgres, RabbitMQ, User-Service)...
docker compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker compose failed. Please ensure Docker Desktop is running.
    pause
    exit /b %ERRORLEVEL%
)

echo Waiting for health checks...
timeout /t 5 /nobreak > nul

:: 2. Backend Services
echo [2/4] Initializing Microservices Stack (Spring Boot)...
powershell -ExecutionPolicy Bypass -File .\start-essential-stack.ps1 -IncludeUserService

echo Giving architecture time to settle...
timeout /t 10 /nobreak > nul

:: 3. Frontend Portal
echo [3/4] Launching Frontend Portal...
cd Project-Microservice-front\front
start "FreeLink Frontend" cmd /k "npm start"

:: 4. Final Verification
echo [4/4] Finalizing...
echo ====================================================
echo [OK] Everything triggered! 
echo.
echo Useful URLs:
echo - Eureka Dashboard: http://localhost:8761
echo - API Gateway:      http://localhost:8091
echo - Frontend:         http://localhost:4200
echo ====================================================
echo.
echo Press any key to open the Eureka Dashboard...
pause > nul
start http://localhost:8761

endlocal
