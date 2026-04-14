param(
  [string]$MySqlUser = $(if ($env:MYSQL_USERNAME) { $env:MYSQL_USERNAME } else { "root" }),
  [string]$MySqlPassword = $(if ($env:MYSQL_PASSWORD) { $env:MYSQL_PASSWORD } else { "" }),
  [string]$PostgresUser = $(if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "postgres" }),
  [string]$PostgresPassword = $(if ($env:POSTGRES_PASSWORD) { $env:POSTGRES_PASSWORD } else { "postgre" }),
  [switch]$IncludeConfigServer = $true,
  [switch]$IncludeUserService
)

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendRoot = Join-Path $projectRoot "Projeet-microservice"

function Test-PortListening {
  param([int]$Port)

  try {
    return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop)
  } catch {
    return $false
  }
}

function Write-DependencyStatus {
  param(
    [string]$Label,
    [int]$Port,
    [string]$Hint
  )

  if (Test-PortListening -Port $Port) {
    Write-Host "[OK] $Label detected on port $Port." -ForegroundColor Green
  } else {
    Write-Host "[WARN] $Label not detected on port $Port. $Hint" -ForegroundColor Yellow
  }
}

function Start-ServiceWindow {
  param(
    [string]$Name,
    [int]$Port,
    [string]$Directory,
    [string]$Command,
    [hashtable]$EnvironmentVariables
  )

  if (Test-PortListening -Port $Port) {
    Write-Host "[SKIP] $Name already listens on port $Port." -ForegroundColor Cyan
    return
  }

  $envLines = @()
  $envLines += "`$env:JAVA_HOME='C:\Users\yusff\.jdks\jbr-17.0.12'"

  foreach ($entry in $EnvironmentVariables.GetEnumerator()) {
    $escapedValue = $entry.Value.Replace("'", "''")
    $envLines += "`$env:$($entry.Key)='$escapedValue'"
  }

  # Check if we can use java -jar instead of mvnw to avoid CreateProcess error=5
  $actualCommand = $Command
  if ($Command -match "mvnw.cmd spring-boot:run") {
    $targetDir = Join-Path $Directory "target"
    if (Test-Path $targetDir) {
      $jarFile = Get-ChildItem -Path $targetDir -Filter "*.jar" | Where-Object { $_.Name -notmatch "original" } | Select-Object -First 1
      if ($jarFile) {
        $actualCommand = "& 'C:\Users\yusff\.jdks\jbr-17.0.12\bin\java.exe' -jar '$($jarFile.FullName)'"
        Write-Host "[INFO] $Name will be started using direct JAR execution." -ForegroundColor Gray
      }
    }
  }

  $scriptBody = @(
    $envLines
    "Set-Location '$Directory'"
    $actualCommand
  ) -join "; "

  Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command", $scriptBody
  ) | Out-Null

  Write-Host "[START] $Name requested on port $Port." -ForegroundColor Green
}

function Ensure-MySqlDatabases {
  param(
    [string]$User,
    [string]$Password
  )

  $mysqlCliCandidates = @(
    "mysql",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.36\bin\mysql.exe"
  )

  $mysqlCli = $mysqlCliCandidates | Where-Object { $_ -eq "mysql" -or (Test-Path $_) } | Select-Object -First 1

  if (-not $mysqlCli) {
    Write-Host "[WARN] mysql client not found. Databases must exist already: gestion_formation, projetdb, microservice, messagerie_db, condidature_db." -ForegroundColor Yellow
    return
  }

  $databaseNames = @(
    "gestion_formation",
    "projetdb",
    "microservice",
    "messagerie_db",
    "condidature_db"
  )

  $sql = ($databaseNames | ForEach-Object { "CREATE DATABASE IF NOT EXISTS $_;" }) -join " "
  $passwordArg = if ([string]::IsNullOrEmpty($Password)) { "" } else { " -p$Password" }
  $command = if ($mysqlCli -eq "mysql") {
    "mysql -u$User$passwordArg -e `"$sql`""
  } else {
    "& '$mysqlCli' -u$User$passwordArg -e `"$sql`""
  }

  try {
    Invoke-Expression $command | Out-Null
    Write-Host "[OK] MySQL databases checked: $($databaseNames -join ', ')." -ForegroundColor Green
  } catch {
    Write-Host "[WARN] Could not create MySQL databases automatically. Ensure they exist manually before launching the services." -ForegroundColor Yellow
  }
}

Write-Host "Preflight checks for the common FreeLink stack" -ForegroundColor White
Write-DependencyStatus -Label "MySQL" -Port 3306 -Hint "Start MySQL first from XAMPP/WAMP, or update MYSQL_USERNAME and MYSQL_PASSWORD."
Write-DependencyStatus -Label "PostgreSQL" -Port 5432 -Hint "Start PostgreSQL first for the Django user-service."
Write-DependencyStatus -Label "RabbitMQ" -Port 5672 -Hint "Evaluation and Skills may need RabbitMQ to fully work."

$sharedEnv = @{
  MYSQL_USERNAME = $MySqlUser
  MYSQL_PASSWORD = $MySqlPassword
  EUREKA_URL = "http://localhost:8761/eureka"
  CONFIG_SERVER_URL = "http://localhost:8888"
}

if (Test-PortListening -Port 3306) {
  Ensure-MySqlDatabases -User $MySqlUser -Password $MySqlPassword
}

Start-ServiceWindow `
  -Name "Eureka Server" `
  -Port 8761 `
  -Directory (Join-Path $backendRoot "Eureka-microservice\Eureka-microservice") `
  -Command ".\mvnw.cmd spring-boot:run" `
  -EnvironmentVariables @{}

if ($IncludeConfigServer) {
  Start-ServiceWindow `
    -Name "Config Server" `
    -Port 8888 `
    -Directory (Join-Path $backendRoot "config-server\config-server") `
    -Command ".\mvnw.cmd spring-boot:run" `
    -EnvironmentVariables @{
      EUREKA_URL = "http://localhost:8761/eureka"
    }
    
  Write-Host "Waiting for Config Server to fully initialize (HTTP check)..." -ForegroundColor Cyan
  $configRetry = 0
  $configSuccess = $false
  while ($configRetry -lt 30) {
    try {
      $response = Invoke-WebRequest -Uri "http://localhost:8888/config-server/default" -UseBasicParsing -ErrorAction Stop
      if ($response.StatusCode -eq 200) {
        Write-Host "[OK] Config Server is ready and serving configuration." -ForegroundColor Green
        $configSuccess = $true
        Start-Sleep -Seconds 2
        break
      }
    } catch {
      # Still warming up
    }
    Start-Sleep -Seconds 3
    $configRetry++
    Write-Host "." -NoNewline
  }
  if (-not $configSuccess) {
    Write-Host "`n[ERROR] Config Server failed to initialize in time. Stack startup aborted." -ForegroundColor Red
    return
  }
} else {
  Write-Host "[INFO] Config Server skipped." -ForegroundColor DarkCyan
}

Start-ServiceWindow `
  -Name "Evaluation Service" `
  -Port 8094 `
  -Directory (Join-Path $backendRoot "EvaluationM-service\Evaluation-service") `
  -Command ".\mvnw.cmd spring-boot:run" `
  -EnvironmentVariables @{
    EUREKA_URL = "http://localhost:8761/eureka"
    CONFIG_SERVER_URL = "http://localhost:8888"
  }

Start-ServiceWindow `
  -Name "Skills Service" `
  -Port 8085 `
  -Directory (Join-Path $backendRoot "skills\microservice\microservice") `
  -Command ".\mvnw.cmd spring-boot:run" `
  -EnvironmentVariables $sharedEnv

Start-ServiceWindow `
  -Name "Project Service" `
  -Port 8086 `
  -Directory (Join-Path $backendRoot "service-projet\service-projet") `
  -Command ".\mvnw.cmd spring-boot:run" `
  -EnvironmentVariables $sharedEnv

Start-ServiceWindow `
  -Name "Formation Service" `
  -Port 8083 `
  -Directory (Join-Path $backendRoot "Gestion-Formation\Gestion-Formation") `
  -Command ".\mvnw.cmd spring-boot:run" `
  -EnvironmentVariables $sharedEnv

Start-ServiceWindow `
  -Name "Messagerie Service" `
  -Port 8087 `
  -Directory (Join-Path $backendRoot "messagerie\messagerie") `
  -Command ".\mvnw.cmd spring-boot:run" `
  -EnvironmentVariables $sharedEnv

Start-ServiceWindow `
  -Name "Condidature Service" `
  -Port 8081 `
  -Directory (Join-Path $backendRoot "condidature-service\condidature-service") `
  -Command ".\mvnw.cmd spring-boot:run" `
  -EnvironmentVariables $sharedEnv

Start-ServiceWindow `
  -Name "API Gateway" `
  -Port 8091 `
  -Directory (Join-Path $backendRoot "API-GATWAYY\API-GATWAYY") `
  -Command ".\mvnw.cmd spring-boot:run" `
  -EnvironmentVariables @{
    EUREKA_URL = "http://localhost:8761/eureka"
  }

if ($IncludeUserService) {
  $userServiceDirectory = Join-Path $backendRoot "userservice"
  $venvPythonPath = Join-Path $userServiceDirectory ".venv\Scripts\python.exe"
  $userServiceCommand = if (Test-Path $venvPythonPath) {
    "& '$venvPythonPath' manage.py migrate --noinput; & '$venvPythonPath' manage.py runserver 8000"
  } else {
    "python manage.py migrate --noinput; python manage.py runserver 8000"
  }

  Start-ServiceWindow `
    -Name "Django User Service" `
    -Port 8000 `
    -Directory $userServiceDirectory `
    -Command $userServiceCommand `
    -EnvironmentVariables @{
      POSTGRES_USER = $PostgresUser
      POSTGRES_PASSWORD = $PostgresPassword
      POSTGRES_DB = "users_db"
      POSTGRES_HOST = "localhost"
      POSTGRES_PORT = "5432"
      ENABLE_DJANGO_CORS = "false"
      CORS_ALLOW_ALL_ORIGINS = "false"
    }
} else {
  Write-Host "[INFO] User-service not started automatically. Add -IncludeUserService if you want the script to start Django too." -ForegroundColor DarkCyan
}

Write-Host ""
Write-Host "Suggested next step:" -ForegroundColor White
Write-Host "  cd '$projectRoot\Project-Microservice-front\front'" -ForegroundColor Gray
Write-Host "  npm start" -ForegroundColor Gray
