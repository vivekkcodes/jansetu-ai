@echo off
echo ========================================================
echo        JANSETU AI: Starting Full Stack Application
echo ========================================================

echo Starting Backend API on http://localhost:8000 ...
start "JanSetu AI Backend" powershell -NoExit -Command "cd '%~dp0backend'; python -m uvicorn app.main:app --reload --port 8000"

echo Starting Frontend UI on http://localhost:5173 ...
start "JanSetu AI Frontend" powershell -NoExit -Command "cd '%~dp0frontend'; npm.cmd run dev"

echo.
echo Application is starting!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://localhost:8000/docs
echo ========================================================
