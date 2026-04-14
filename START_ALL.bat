@echo off
title FreeLink - Microservices ^& Portal Starter
echo ====================================================
echo Starting Microservices Architecture (Bypassing Policy)
echo ====================================================

:: 1. Launch all backend services via the PowerShell script
powershell -ExecutionPolicy Bypass -File .\start-essential-stack.ps1

:: Small delay to let the stack start initializing
timeout /t 5 /nobreak ^> nul

:: 2. Launch the integrated Angular Frontend
echo Starting Frontend Portal...
cd Project-Microservice-front\front
start "FreeLink Frontend" cmd /k "npm start"

echo ====================================================
echo All services triggered! 
echo Please check individual windows for logs.
echo ====================================================
pause
