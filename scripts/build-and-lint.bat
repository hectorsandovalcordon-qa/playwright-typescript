@echo off
echo 🔨 Compilando y verificando código...
echo.

echo 📦 Compilando TypeScript...
npm run build

echo 🧹 Ejecutando ESLint...
npm run lint

echo 💅 Formateando código...
npm run format

echo ✅ Build y lint completados
pause
