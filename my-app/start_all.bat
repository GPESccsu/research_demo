@echo off
setlocal

cd /d "%~dp0"

echo [SciFlow] Starting backend...
start "SciFlow Backend" cmd /k "cd /d "%~dp0backend" && call start_backend.bat"

echo [SciFlow] Starting frontend...
start "SciFlow Frontend" cmd /k "cd /d "%~dp0" && npm run dev"

echo [SciFlow] All services launched.
endlocal
