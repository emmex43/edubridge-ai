# Starts the EduBridge AI backend in the foreground.
#
# Secrets are NOT set here. They are loaded from backend\.env by
# app/core/config.py. This script previously hardcoded the OpenAI key and the
# JWT secret, which put live credentials in a plaintext file that was one
# `git add .` away from being committed.
#
#   .\start_server.ps1            normal
#   .\start_server.ps1 -Reload    auto-reload on code changes (development)

param([switch]$Reload)

$ErrorActionPreference = "Stop"
$backend = $PSScriptRoot
$python = Join-Path $backend "venv\Scripts\python.exe"

if (-not (Test-Path $python)) {
    Write-Host "No virtualenv at $python" -ForegroundColor Red
    Write-Host "Create it with:  python -m venv venv; .\venv\Scripts\pip install -r requirements.txt"
    exit 1
}

if (-not (Test-Path (Join-Path $backend ".env"))) {
    Write-Host "backend\.env is missing." -ForegroundColor Red
    Write-Host "Copy backend\.env.example to backend\.env and fill in the real values."
    exit 1
}

Set-Location $backend
Write-Host "EduBridge AI backend -> http://localhost:8000  (API docs at /docs)" -ForegroundColor Cyan

$uvicornArgs = @("-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000")
if ($Reload) { $uvicornArgs += "--reload" }

& $python @uvicornArgs
