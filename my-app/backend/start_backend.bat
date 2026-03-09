@echo off
setlocal

set "ENV_NAME=%~1"
if "%ENV_NAME%"=="" set "ENV_NAME=pytorch_gpu"

cd /d "%~dp0"

call "G:\Users\Administrator.DESKTOP-81B93A8\anaconda3\Scripts\activate.bat" "G:\Users\Administrator.DESKTOP-81B93A8\anaconda3"
call conda activate %ENV_NAME%

python --version
where python

python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000

pause
endlocal