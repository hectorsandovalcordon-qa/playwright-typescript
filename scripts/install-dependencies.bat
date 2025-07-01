@echo off
echo 📦 Instalando dependencias del framework...
echo.

echo 🔄 Instalando paquetes npm...
npm install

echo 🎭 Instalando navegadores de Playwright...
npx playwright install

echo ✅ Dependencias instaladas correctamente
echo.
echo 🚀 Framework listo para usar
echo.
echo Comandos disponibles:
echo - scripts\setup-new-client.bat <nombre>      : Crear nuevo cliente
echo - scripts\run-client-tests.bat <nombre>     : Ejecutar tests de cliente
echo - scripts\test-all-clients.bat               : Ejecutar todos los tests
echo - scripts\build-and-lint.bat                 : Compilar y verificar código
echo.
pause
