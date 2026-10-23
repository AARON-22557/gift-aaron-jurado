@echo off
title MicroOS PC Chat Launcher
cd /d "%~dp0"

echo ===================================================
echo     Iniciando MicroOS PC Chat System...
echo ===================================================
echo.

if not exist node_modules (
    echo Instalando dependencias por primera vez...
    call npm install
    echo.
)

echo Iniciando servidor en segundo plano...
start "MicroOS Server" /min node server.js

echo Esperando a que el servidor este listo...
timeout /t 2 /nobreak > nul

echo Abriendo la aplicacion en modo ventana de App...
start msedge --app=http://localhost:3000 2>nul || start chrome --app=http://localhost:3000 2>nul || start http://localhost:3000

echo.
echo ===================================================
echo   MicroOS PC Chat se esta ejecutando.
echo   Puedes minimizar esta ventana.
echo ===================================================
