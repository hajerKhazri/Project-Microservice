# Function to wait for a port to be open
function WaitForPort($port, $timeoutSeconds = 60) {
    Write-Host "Waiting for port $port to be open..." -ForegroundColor Cyan
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    while ($stopwatch.Elapsed.TotalSeconds -lt $timeoutSeconds) {
        try {
            $tcpClient = New-Object System.Net.Sockets.TcpClient
            Wait-Event -Timeout 1 # Small delay
            $tcpClient.Connect("127.0.0.1", $port)
            if ($tcpClient.Connected) {
                $tcpClient.Close()
                Write-Host "Port $port is open!" -ForegroundColor Green
                return $true
            }
        } catch {
            # Ignore connection errors
        }
        Start-Sleep -Seconds 2
    }
    Write-Host "Timeout waiting for port $port." -ForegroundColor Red
    return $false
}

Write-Host "`n--- Starting Microservices Architecture ---`n" -ForegroundColor Yellow

# 1. Start Eureka Server
Write-Host "1. Starting Eureka Server (8761)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd eureka-server; .\mvnw spring-boot:run"
if (!(WaitForPort 8761)) { 
    Write-Host "Eureka Server failed to start." -ForegroundColor Red
    exit 1 
}

# 2. Start Config Server
Write-Host "2. Starting Config Server (8888)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd config-server; .\mvnw spring-boot:run"
if (!(WaitForPort 8888)) { 
    Write-Host "Config Server failed to start." -ForegroundColor Red
    exit 1 
}

# 3. Start API Gateway
Write-Host "3. Starting API Gateway (8060)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd microservices/api-gateway; .\mvnw spring-boot:run"

# 4. Start Messagerie
Write-Host "4. Starting Messagerie (8085)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd messagerie; .\mvnw spring-boot:run"

Write-Host "`nAll services have been triggered! Please check the individual PowerShell windows for logs.`n" -ForegroundColor Green
