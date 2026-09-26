@echo off
echo Starting Datastraw Support CRM FastAPI Server...
cd /d "%~dp0backend"
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
pause
