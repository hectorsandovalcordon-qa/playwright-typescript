@echo off
setlocal enabledelayedexpansion

if "%1"=="" (
    echo Uso: setup-new-client.bat <nombre-cliente>
    exit /b 1
)

set CLIENT_NAME=%1
set CLIENT_DIR=src\clients\%CLIENT_NAME%

echo 🏗️  Creando estructura para cliente: %CLIENT_NAME%

REM Crear directorios
mkdir "%CLIENT_DIR%\config" 2>nul
mkdir "%CLIENT_DIR%\pages" 2>nul
mkdir "%CLIENT_DIR%\tests" 2>nul
mkdir "%CLIENT_DIR%\data" 2>nul
mkdir "%CLIENT_DIR%\auth" 2>nul

REM Crear archivo de configuración
(
echo import { defineConfig } from '@playwright/test';
echo import { Config } from '../../../core/config/Config';
echo import { ClientConfig } from '../../../core/config/ClientConfig';
echo.
echo const clientConfig: ClientConfig = {
echo   name: '%CLIENT_NAME%',
echo   baseUrl: process.env.%CLIENT_NAME^_BASE_URL || 'https://%CLIENT_NAME%.example.com',
echo   timeout: 30000,
echo   credentials: {
echo     username: process.env.%CLIENT_NAME^_USERNAME || '',
echo     password: process.env.%CLIENT_NAME^_PASSWORD || ''
echo   },
echo   customSelectors: {
echo     // Agregar selectores específicos del cliente
echo   },
echo   apiEndpoints: {
echo     // Agregar endpoints específicos del cliente
echo   }
echo };
echo.
echo Config.getInstance().setClientConfig(clientConfig);
echo.
echo export default defineConfig({
echo   testDir: '../tests',
echo   use: {
echo     baseURL: clientConfig.baseUrl,
echo     actionTimeout: clientConfig.timeout,
echo   },
echo   projects: [
echo     {
echo       name: '%CLIENT_NAME%-chrome',
echo       use: { 
echo         ...require('@playwright/test').devices['Desktop Chrome']
echo       },
echo     }
echo   ]
echo });
) > "%CLIENT_DIR%\config\%CLIENT_NAME%.config.ts"

REM Crear página de ejemplo
(
echo import { Page } from '@playwright/test';
echo import { BasePage } from '../../../core/base/BasePage';
echo.
echo export class HomePage extends BasePage {
echo   constructor(page: Page) {
echo     super(page);
echo   }
echo.
echo   async navigate(): Promise<void> {
echo     await this.page.goto('/');
echo     await this.waitForNavigation();
echo   }
echo.
echo   async isLoaded(): Promise<boolean> {
echo     return await this.isVisible('body');
echo   }
echo }
) > "%CLIENT_DIR%\pages\HomePage.ts"

REM Crear test de ejemplo
(
echo import { test, expect } from '../../../core/base/BaseTest';
echo import { HomePage } from '../pages/HomePage';
echo.
echo test.describe('%CLIENT_NAME% - Example Tests', () => {
echo   let homePage: HomePage;
echo.
echo   test.beforeEach(async ({ commonPage }) => {
echo     homePage = new HomePage(commonPage);
echo   });
echo.
echo   test('should load home page', async ({ logger }) => {
echo     logger.info('Testing home page load for %CLIENT_NAME%');
echo     
echo     await homePage.navigate();
echo     
echo     expect(await homePage.isLoaded()).toBeTruthy();
echo     logger.info('Home page loaded successfully');
echo   });
echo });
) > "%CLIENT_DIR%\tests\example.spec.ts"

REM Crear datos de ejemplo
(
echo {
echo   "users": [
echo     {
echo       "username": "testuser@%CLIENT_NAME%.com",
echo       "password": "Test123",
echo       "role": "admin"
echo     }
echo   ],
echo   "environment": {
echo     "name": "%CLIENT_NAME%",
echo     "timeout": 30000
echo   }
echo }
) > "%CLIENT_DIR%\data\testdata.json"

echo ✅ Estructura creada para cliente: %CLIENT_NAME%
echo 📁 Directorio: %CLIENT_DIR%
echo.
echo 📝 Próximos pasos:
echo 1. Configurar variables de entorno en .env:
echo    %CLIENT_NAME^_USERNAME=tu-usuario
echo    %CLIENT_NAME^_PASSWORD=tu-password  
echo    %CLIENT_NAME^_BASE_URL=https://tu-url.com
echo.
echo 2. Personalizar configuración en: %CLIENT_DIR%\config\%CLIENT_NAME%.config.ts
echo 3. Implementar páginas en: %CLIENT_DIR%\pages\
echo 4. Escribir tests en: %CLIENT_DIR%\tests\
echo.
echo 🚀 Ejecutar tests: scripts\run-client-tests.bat %CLIENT_NAME%

pause
