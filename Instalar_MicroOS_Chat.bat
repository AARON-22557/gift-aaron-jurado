@echo off
title Instalar MicroOS Chat App en el Escritorio
cd /d "%~dp0"

echo ===================================================
echo     INSTALADOR DE MICROOS CHAT APP EN ESCRITORIO
echo ===================================================
echo.

set TARGET_DIR=C:\MicroOS_Chat

echo 1. Creando carpeta de aplicacion en %TARGET_DIR%...
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

echo 2. Copiando archivos de la app...
xcopy /E /Y /I "%~dp0*" "%TARGET_DIR%" > nul

echo 3. Instalando dependencias de la aplicacion...
cd /d "%TARGET_DIR%"
call npm install

echo 4. Creando acceso directo con icono en el Escritorio de Windows...
powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut([System.IO.Path]::Combine([Environment]::GetFolderPath('Desktop'), 'MicroOS Chat.lnk')); $s.TargetPath='%TARGET_DIR%\Iniciar_MicroOS_Chat.bat'; $s.WorkingDirectory='%TARGET_DIR%'; $s.Description='MicroOS Chat App'; $s.IconLocation='shell32.dll,14'; $s.Save()"

echo.
echo ===================================================
echo   ¡INSTALACION COMPLETADA CON EXITO!
echo   Se ha creado un icono llamado "MicroOS Chat"
echo   directamente en tu Escritorio de Windows.
echo ===================================================
echo.
pause
