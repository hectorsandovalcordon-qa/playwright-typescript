import { Page } from '@playwright/test';
import { Logger } from './Logger';
import { Config } from '../config/Config';
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import { ScreenshotInfo } from '../interfaces/ScreenshotInfo';
import { ScreenshotType } from '../enums/ScreenshotType';
import { ScreenshotConfig } from '../interfaces/ScreenshotConfig';

/**
 * Clase para manejo avanzado de screenshots en el framework
 * Proporciona funcionalidades para capturar, organizar y comparar screenshots
 */
export class ScreenshotUtils {
  private page: Page;
  private logger: Logger;
  private config: Config;
  private baseDirectory: string;
  private screenshotCounter: number = 0;
  private screenshotHistory: ScreenshotInfo[] = [];

  constructor(page: Page) {
    this.page = page;
    this.logger = Logger.getInstance();
    this.config = Config.getInstance();
    this.baseDirectory = this.initializeDirectory();
  }

  // ===================================
  // CONFIGURACIÓN E INICIALIZACIÓN
  // ===================================

  /**
   * Inicializa el directorio base para screenshots
   */
  private initializeDirectory(): string {
    const clientName = this.config.getClientName();
    const baseDir = path.join('screenshots', clientName);
    
    // Crear directorios si no existen
    this.ensureDirectoryExists(baseDir);
    this.ensureDirectoryExists(path.join(baseDir, 'full-page'));
    this.ensureDirectoryExists(path.join(baseDir, 'elements'));
    this.ensureDirectoryExists(path.join(baseDir, 'errors'));
    this.ensureDirectoryExists(path.join(baseDir, 'comparisons'));
    this.ensureDirectoryExists(path.join(baseDir, 'steps'));
    
    return baseDir;
  }

  /**
   * Asegura que un directorio existe
   */
  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      this.logger.debug(`Created screenshot directory: ${dir}`);
    }
  }

  /**
   * Genera un nombre único para el screenshot
   */
  private generateScreenshotName(baseName: string, type: ScreenshotType): string {
    this.screenshotCounter++;
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss-SSS');
    const counter = this.screenshotCounter.toString().padStart(3, '0');
    
    return `${counter}_${baseName}_${type}_${timestamp}.png`;
  }

  /**
   * Obtiene la ruta completa para un screenshot
   */
  private getScreenshotPath(name: string, type: ScreenshotType): string {
    let subDir = '';
    
    switch (type) {
      case ScreenshotType.FULL_PAGE:
        subDir = 'full-page';
        break;
      case ScreenshotType.ELEMENT:
        subDir = 'elements';
        break;
      case ScreenshotType.ERROR:
        subDir = 'errors';
        break;
      case ScreenshotType.COMPARISON:
        subDir = 'comparisons';
        break;
      case ScreenshotType.STEP:
      case ScreenshotType.BEFORE_ACTION:
      case ScreenshotType.AFTER_ACTION:
        subDir = 'steps';
        break;
      default:
        subDir = 'general';
        this.ensureDirectoryExists(path.join(this.baseDirectory, subDir));
    }
    
    return path.join(this.baseDirectory, subDir, name);
  }

  // ===================================
  // MÉTODOS PRINCIPALES DE SCREENSHOT
  // ===================================

  /**
   * Toma un screenshot de página completa
   */
  async takeFullPageScreenshot(name: string, options?: ScreenshotConfig): Promise<ScreenshotInfo> {
    this.logger.debug(`Taking full page screenshot: ${name}`);
    
    try {
      const fileName = this.generateScreenshotName(name, ScreenshotType.FULL_PAGE);
      const filePath = this.getScreenshotPath(fileName, ScreenshotType.FULL_PAGE);
      
      const screenshotOptions = {
        path: filePath,
        fullPage: true,
        animations: options?.animations || 'disabled',
        caret: options?.caret || 'hide',
        scale: options?.scale || 'css',
        ...(options?.mask && { mask: options.mask }),
        ...(options?.quality && { quality: options.quality }),
        ...(options?.clip && { clip: options.clip })
      } as const;

      await this.page.screenshot(screenshotOptions);
      
      const screenshotInfo = await this.createScreenshotInfo(
        filePath, 
        fileName, 
        ScreenshotType.FULL_PAGE
      );
      
      this.screenshotHistory.push(screenshotInfo);
      this.logger.screenshot(filePath, `Full page: ${name}`);
      
      return screenshotInfo;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to take full page screenshot: ${errorMessage}`);
      throw new Error(`Screenshot failed: ${errorMessage}`);
    }
  }

  /**
   * Toma un screenshot del viewport actual
   */
  async takeViewportScreenshot(name: string, options?: ScreenshotConfig): Promise<ScreenshotInfo> {
    this.logger.debug(`Taking viewport screenshot: ${name}`);
    
    try {
      const fileName = this.generateScreenshotName(name, ScreenshotType.VIEWPORT);
      const filePath = this.getScreenshotPath(fileName, ScreenshotType.VIEWPORT);
      
      const screenshotOptions = {
        path: filePath,
        fullPage: false,
        animations: options?.animations || 'disabled',
        caret: options?.caret || 'hide',
        ...(options?.quality && { quality: options.quality })
      } as const;

      await this.page.screenshot(screenshotOptions);
      
      const screenshotInfo = await this.createScreenshotInfo(
        filePath, 
        fileName, 
        ScreenshotType.VIEWPORT
      );
      
      this.screenshotHistory.push(screenshotInfo);
      this.logger.screenshot(filePath, `Viewport: ${name}`);
      
      return screenshotInfo;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to take viewport screenshot: ${errorMessage}`);
      throw new Error(`Screenshot failed: ${errorMessage}`);
    }
  }

  /**
   * Toma un screenshot de un elemento específico
   */
  async takeElementScreenshot(
    selector: string, 
    name: string, 
    options?: ScreenshotConfig
  ): Promise<ScreenshotInfo> {
    this.logger.debug(`Taking element screenshot: ${name} (${selector})`);
    
    try {
      const element = this.page.locator(selector);
      
      // Verificar que el elemento existe y es visible
      await element.waitFor({ state: 'visible', timeout: 5000 });
      
      const fileName = this.generateScreenshotName(name, ScreenshotType.ELEMENT);
      const filePath = this.getScreenshotPath(fileName, ScreenshotType.ELEMENT);
      
      await element.screenshot({
        path: filePath,
        animations: options?.animations || 'disabled',
        caret: options?.caret || 'hide',
        ...(options?.quality && { quality: options.quality })
      });
      
      const screenshotInfo = await this.createScreenshotInfo(
        filePath, 
        fileName, 
        ScreenshotType.ELEMENT
      );
      
      screenshotInfo.url = `Element: ${selector}`;
      this.screenshotHistory.push(screenshotInfo);
      this.logger.screenshot(filePath, `Element: ${name} (${selector})`);
      
      return screenshotInfo;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to take element screenshot: ${errorMessage}`, { selector });
      throw new Error(`Element screenshot failed: ${errorMessage}`);
    }
  }

  /**
   * Toma un screenshot de error con contexto adicional
   */
  async takeErrorScreenshot(
    error: Error, 
    context?: { testName?: string; stepNumber?: number; selector?: string }
  ): Promise<ScreenshotInfo> {
    const errorName = error.name || 'UnknownError';
    const name = `error_${errorName}`;
    
    this.logger.debug(`Taking error screenshot: ${name}`);
    
    try {
      const fileName = this.generateScreenshotName(name, ScreenshotType.ERROR);
      const filePath = this.getScreenshotPath(fileName, ScreenshotType.ERROR);
      
      // Screenshot de página completa para errores
      await this.page.screenshot({
        path: filePath,
        fullPage: true,
        animations: 'disabled'
      });
      
      const screenshotInfo = await this.createScreenshotInfo(
        filePath, 
        fileName, 
        ScreenshotType.ERROR
      );
      
      // Agregar contexto del error
      screenshotInfo.testName = context?.testName;
      screenshotInfo.stepNumber = context?.stepNumber;
      screenshotInfo.url = this.page.url();
      
      this.screenshotHistory.push(screenshotInfo);
      this.logger.screenshot(filePath, `Error: ${errorName}`, {
      ...context,
      stepNumber: context?.stepNumber?.toString()
      });

      // También loggear el error
      this.logger.exception(error, { 
      screenshot: filePath, 
      ...context,
      stepNumber: context?.stepNumber?.toString()
      });
      return screenshotInfo;
      
    } catch (screenshotError) {
      const errorMessage = screenshotError instanceof Error ? screenshotError.message : String(screenshotError);
      this.logger.error(`Failed to take error screenshot: ${errorMessage}`);
      throw new Error(`Error screenshot failed: ${errorMessage}`);
    }
  }

  /**
   * Toma un screenshot de paso de test
   */
  async takeStepScreenshot(
    stepName: string, 
    stepNumber?: number, 
    options?: ScreenshotConfig
  ): Promise<ScreenshotInfo> {
    const name = `step_${stepNumber || this.screenshotCounter}_${stepName}`;
    
    this.logger.debug(`Taking step screenshot: ${name}`);
    
    try {
      const fileName = this.generateScreenshotName(name, ScreenshotType.STEP);
      const filePath = this.getScreenshotPath(fileName, ScreenshotType.STEP);
      
      await this.page.screenshot({
        path: filePath,
        fullPage: options?.fullPage || false,
        animations: options?.animations || 'disabled',
        caret: options?.caret || 'hide'
      });
      
      const screenshotInfo = await this.createScreenshotInfo(
        filePath, 
        fileName, 
        ScreenshotType.STEP
      );
      
      screenshotInfo.stepNumber = stepNumber;
      screenshotInfo.url = this.page.url();
      this.screenshotHistory.push(screenshotInfo);
      
      this.logger.screenshot(filePath, `Step: ${stepName}`, { stepNumber: stepNumber?.toString() });
      
      return screenshotInfo;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to take step screenshot: ${errorMessage}`);
      throw new Error(`Step screenshot failed: ${errorMessage}`);
    }
  }

  // ===================================
  // MÉTODOS DE COMPARACIÓN
  // ===================================

  /**
   * Toma un screenshot para comparación visual
   */
  async takeComparisonScreenshot(
    name: string, 
    baselinePath?: string, 
    options?: ScreenshotConfig
  ): Promise<{ current: ScreenshotInfo; baseline?: string; isDifferent?: boolean }> {
    this.logger.debug(`Taking comparison screenshot: ${name}`);
    
    try {
      const fileName = this.generateScreenshotName(name, ScreenshotType.COMPARISON);
      const filePath = this.getScreenshotPath(fileName, ScreenshotType.COMPARISON);
      
      await this.page.screenshot({
        path: filePath,
        fullPage: options?.fullPage || true,
        animations: 'disabled',
        caret: 'hide'
      });
      
      const screenshotInfo = await this.createScreenshotInfo(
        filePath, 
        fileName, 
        ScreenshotType.COMPARISON
      );
      
      this.screenshotHistory.push(screenshotInfo);
      this.logger.screenshot(filePath, `Comparison: ${name}`);
      
      const result: { current: ScreenshotInfo; baseline?: string; isDifferent?: boolean } = {
        current: screenshotInfo
      };
      
      // Si hay baseline, comparar
      if (baselinePath && fs.existsSync(baselinePath)) {
        result.baseline = baselinePath;
        // Aquí podrías implementar comparación real de imágenes
        // Por ahora solo indicamos que existe baseline
        this.logger.info(`Comparison screenshot taken with baseline: ${baselinePath}`);
      }
      
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to take comparison screenshot: ${errorMessage}`);
      throw new Error(`Comparison screenshot failed: ${errorMessage}`);
    }
  }

  // ===================================
  // MÉTODOS BEFORE/AFTER ACTIONS
  // ===================================

  /**
   * Toma screenshot antes de una acción
   */
  async takeBeforeActionScreenshot(
    action: string, 
    selector?: string, 
    options?: ScreenshotConfig
  ): Promise<ScreenshotInfo> {
    const name = `before_${action}${selector ? `_${selector.replace(/[^a-zA-Z0-9]/g, '_')}` : ''}`;
    
    const fileName = this.generateScreenshotName(name, ScreenshotType.BEFORE_ACTION);
    const filePath = this.getScreenshotPath(fileName, ScreenshotType.BEFORE_ACTION);
    
    await this.page.screenshot({
      path: filePath,
      fullPage: options?.fullPage || false,
      animations: 'disabled'
    });
    
    const screenshotInfo = await this.createScreenshotInfo(
      filePath, 
      fileName, 
      ScreenshotType.BEFORE_ACTION
    );
    
    screenshotInfo.url = this.page.url();
    this.screenshotHistory.push(screenshotInfo);
    
    this.logger.screenshot(filePath, `Before ${action}`, { action, selector });
    
    return screenshotInfo;
  }

  /**
   * Toma screenshot después de una acción
   */
  async takeAfterActionScreenshot(
    action: string, 
    selector?: string, 
    options?: ScreenshotConfig
  ): Promise<ScreenshotInfo> {
    const name = `after_${action}${selector ? `_${selector.replace(/[^a-zA-Z0-9]/g, '_')}` : ''}`;
    
    const fileName = this.generateScreenshotName(name, ScreenshotType.AFTER_ACTION);
    const filePath = this.getScreenshotPath(fileName, ScreenshotType.AFTER_ACTION);
    
    // Esperar un poco para que se complete la acción
    await this.page.waitForTimeout(500);
    
    await this.page.screenshot({
      path: filePath,
      fullPage: options?.fullPage || false,
      animations: 'disabled'
    });
    
    const screenshotInfo = await this.createScreenshotInfo(
      filePath, 
      fileName, 
      ScreenshotType.AFTER_ACTION
    );
    
    screenshotInfo.url = this.page.url();
    this.screenshotHistory.push(screenshotInfo);
    
    this.logger.screenshot(filePath, `After ${action}`, { action, selector });
    
    return screenshotInfo;
  }

  // ===================================
  // MÉTODOS DE UTILIDAD
  // ===================================

  /**
   * Crea información detallada del screenshot
   */
  private async createScreenshotInfo(
    filePath: string, 
    fileName: string, 
    type: ScreenshotType
  ): Promise<ScreenshotInfo> {
    const stats = fs.statSync(filePath);
    
    const info: ScreenshotInfo = {
      path: filePath,
      name: fileName,
      type,
      timestamp: moment().toISOString(),
      size: stats.size,
      url: this.page.url()
    };
    
    try {
      // Obtener dimensiones si es posible (requiere biblioteca adicional)
      // Por ahora solo devolvemos la información básica
      this.logger.debug(`Screenshot created: ${fileName} (${stats.size} bytes)`);
    } catch (error) {
      this.logger.debug(`Could not get screenshot dimensions: ${fileName}`);
    }
    
    return info;
  }

  /**
   * Obtiene todos los screenshots tomados en la sesión actual
   */
  getScreenshotHistory(): ScreenshotInfo[] {
    return [...this.screenshotHistory];
  }

  /**
   * Obtiene screenshots por tipo
   */
  getScreenshotsByType(type: ScreenshotType): ScreenshotInfo[] {
    return this.screenshotHistory.filter(screenshot => screenshot.type === type);
  }

  /**
   * Obtiene el último screenshot tomado
   */
  getLastScreenshot(): ScreenshotInfo | null {
    return this.screenshotHistory.length > 0 
      ? this.screenshotHistory[this.screenshotHistory.length - 1] 
      : null;
  }

  /**
   * Limpia screenshots antiguos
   */
  cleanOldScreenshots(daysToKeep: number = 7): number {
    let deletedCount = 0;
    const cutoffDate = moment().subtract(daysToKeep, 'days');
    
    try {
      deletedCount = this.cleanDirectoryRecursively(this.baseDirectory, cutoffDate);
      this.logger.info(`Cleaned screenshots older than ${daysToKeep} days`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to clean old screenshots: ${errorMessage}`);
    }
    
    return deletedCount;
  }

  /**
   * Limpia directorio recursivamente
   */
  private cleanDirectoryRecursively(dir: string, cutoffDate: moment.Moment): number {
    let deletedCount = 0;
    
    if (!fs.existsSync(dir)) return deletedCount;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        deletedCount += this.cleanDirectoryRecursively(fullPath, cutoffDate);
      } else if (stats.isFile() && item.endsWith('.png')) {
        if (moment(stats.mtime).isBefore(cutoffDate)) {
          fs.unlinkSync(fullPath);
          deletedCount++;
          this.logger.debug(`Deleted old screenshot: ${item}`);
        }
      }
    }
    
    return deletedCount;
  }

  /**
   * Genera reporte de screenshots
   */
  generateScreenshotReport(): {
    total: number;
    byType: { [key in ScreenshotType]?: number };
    totalSize: number;
    directory: string;
  } {
    const byType: { [key in ScreenshotType]?: number } = {};
    let totalSize = 0;
    
    for (const screenshot of this.screenshotHistory) {
      byType[screenshot.type] = (byType[screenshot.type] || 0) + 1;
      totalSize += screenshot.size;
    }
    
    return {
      total: this.screenshotHistory.length,
      byType,
      totalSize,
      directory: this.baseDirectory
    };
  }

  /**
   * Resetea el contador y historial
   */
  reset(): void {
    this.screenshotCounter = 0;
    this.screenshotHistory = [];
    this.logger.debug('Screenshot utils reset');
  }

  // ===================================
  // MÉTODOS DE CONVENIENCIA
  // ===================================

  /**
   * Toma screenshot simple (método de conveniencia)
   */
  async takeScreenshot(name: string, fullPage: boolean = true): Promise<string> {
    const screenshotInfo = fullPage 
      ? await this.takeFullPageScreenshot(name)
      : await this.takeViewportScreenshot(name);
    
    return screenshotInfo.path;
  }

  /**
   * Toma screenshot de elemento (método de conveniencia)
   */
  async captureElement(selector: string, name?: string): Promise<string> {
    const screenshotName = name || `element_${selector.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const screenshotInfo = await this.takeElementScreenshot(selector, screenshotName);
    return screenshotInfo.path;
  }

  /**
   * Toma screenshot de error (método de conveniencia)
   */
  async captureError(error: Error, testName?: string): Promise<string> {
    const screenshotInfo = await this.takeErrorScreenshot(error, { testName });
    return screenshotInfo.path;
  }
}