# PlacePro AI — local dev launcher (Windows PowerShell)
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example" -ForegroundColor Yellow
}

Write-Host "`n=== PlacePro AI Local Setup ===" -ForegroundColor Cyan

# Check Docker for Postgres
$dockerOk = $false
try {
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $dockerOk = $true }
} catch {}

if ($dockerOk) {
    Write-Host "Starting PostgreSQL + Redis via Docker..." -ForegroundColor Green
    docker compose up postgres redis -d
    Start-Sleep -Seconds 5
    npm run db:push
    npm run db:seed
} else {
    Write-Host "Docker not found. Ensure PostgreSQL is running on localhost:5432" -ForegroundColor Yellow
    Write-Host "  User: placepro  Password: placepro  Database: placepro" -ForegroundColor Yellow
    Write-Host "  Or install Docker Desktop and re-run this script.`n" -ForegroundColor Yellow
    $r = Read-Host "Try db:push now? (y/n)"
    if ($r -eq "y") {
        npm run db:push
        npm run db:seed
    }
}

Write-Host "`nStarting API (port 4000) and Web (port 3000)..." -ForegroundColor Green
Write-Host "  Web:  http://localhost:3000" -ForegroundColor White
Write-Host "  API:  http://localhost:4000/health" -ForegroundColor White
Write-Host "  Demo: student@placepro.ai / password123`n" -ForegroundColor White

npm run dev
