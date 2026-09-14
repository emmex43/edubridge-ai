@echo off
REM Runs the backend test suite.
REM
REM   run_test.bat          offline suite (the model is stubbed -- free and fast)
REM   run_test.bat live     full suite including the live provider tests
REM
REM Secrets are NOT set here; they come from backend\.env via app/core/config.py.

cd /d "%~dp0"

if not exist "venv\Scripts\python.exe" (
    echo No virtualenv found at venv\. Create it with:
    echo     python -m venv venv
    echo     venv\Scripts\pip install -r requirements.txt
    exit /b 1
)

REM pytest.ini deselects the `live` marker by default, so selecting it has to be
REM asked for explicitly -- a bare `pytest` here would run the offline suite.
if /i "%~1"=="live" (
    venv\Scripts\python.exe -m pytest -m live
) else (
    venv\Scripts\python.exe -m pytest
)
exit /b %ERRORLEVEL%
