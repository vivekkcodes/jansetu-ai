# JanSetu AI - One-Click Launcher for Windows PowerShell

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       JANSETU AI: Citizen Voice to Development Priority" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

$RootPath = $PSScriptRoot

# 1. Check Python
Write-Host "[1/3] Verifying Python backend dependencies..." -ForegroundColor Yellow
python -m pip install -q -r "$RootPath\backend\requirements.txt"

# 2. Check Database & Seed if missing
if (-not (Test-Path "$RootPath\jansetu.db")) {
    Write-Host "[2/3] Seeding demo database (5,000+ reports across 5 districts)..." -ForegroundColor Yellow
    python "$RootPath\data\seed_generator.py"
} else {
    Write-Host "[2/3] Found existing jansetu.db." -ForegroundColor Green
}

# 3. Launch Backend & Frontend in separate processes
Write-Host "[3/3] Starting Backend API (Port 8000) & Frontend UI (Port 5173)..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootPath\backend'; uvicorn app.main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootPath\frontend'; npm.cmd run dev"

Write-Host "`n>> JanSetu AI is starting!" -ForegroundColor Green
Write-Host "   Frontend Portal:   http://localhost:5173" -ForegroundColor White
Write-Host "   FastAPI Swagger:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
