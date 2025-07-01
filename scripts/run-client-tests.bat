@echo off
setlocal enabledelayedexpansion

if "%1"=="" (
    echo Uso: run-client-tests.bat <nombre-cliente>
    echo Ejemplo: run-client-tests.bat client-a
    exit /b 1
)

set CLIENT_NAME=%1
set CONFIG_PATH=src\clients\%CLIENT_NAME%\config\%CLIENT_NAME%.config.ts

if not exist "%CONFIG_PATH%" (
    echo ❌ ERROR: No se encontró la configuración para el cliente '%CLIENT_NAME%'
    echo Archivo esperado: %CONFIG_PATH%
    exit /b 1
)

echo 🚀 Ejecutando tests para cliente: %CLIENT_NAME%
echo 📁 Configuración: %CONFIG_PATH%

REM Crear directorios necesarios
mkdir reports\%CLIENT_NAME% 2>nul
mkdir logs 2>nul

REM Ejecutar tests
set CLIENT=%CLIENT_NAME%
npx playwright test --config=%CONFIG_PATH%

echo ✅ Tests completados para %CLIENT_NAME%
echo 📊 Reportes disponibles en: reports\%CLIENT_NAME%

pause
