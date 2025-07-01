@echo off
echo 🚀 Ejecutando tests para todos los clientes...
echo.

for /d %d in (src\clients\*) do (
    set CLIENT_NAME=%~nd
    echo 📁 Ejecutando tests para: 
    call scripts\run-client-tests.bat 
    echo.
)

echo ✅ Tests completados para todos los clientes
pause
