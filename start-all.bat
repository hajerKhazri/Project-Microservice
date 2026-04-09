@echo off
title Microservices Architecture Starter
SETLOCAL

echo ==========================================
echo Starting Microservices Architecture
echo ==========================================

:: 1. Eureka Server
echo [1/4] Starting Eureka Server (8761)...
pushd eureka-server
start "Eureka Server" cmd /k "mvnw spring-boot:run"
popd

echo Waiting for Eureka Server (15s)...
timeout /t 15 /nobreak > nul

:: 2. Config Server
echo [2/4] Starting Config Server (8888)...
pushd config-server
start "Config Server" cmd /k "mvnw spring-boot:run"
popd

echo Waiting for Config Server (15s)...
timeout /t 15 /nobreak > nul

:: 3. API Gateway
echo [3/4] Starting API Gateway (8060)...
pushd microservices\api-gateway
start "API Gateway" cmd /k "mvnw spring-boot:run"
popd

:: 4. Messagerie
echo [4/4] Starting Messagerie (8085)...
pushd messagerie
start "Messagerie" cmd /k "mvnw spring-boot:run"
popd

echo ==========================================
echo All services have been triggered!
echo Check individual windows for logs.
echo ==========================================
pause
