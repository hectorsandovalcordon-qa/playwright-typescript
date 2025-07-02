import { LoggerConfig } from '@core/interfaces/LoggerConfig';
import { LogContext } from '@core/interfaces/LogContext';
import { LogLevel } from '@core/enums/LogLevel';
import winston from 'winston';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
/**
 * Clase Logger singleton para el framework de automatización
 * Proporciona logging estructurado con múltiples niveles y salidas
 */
export class Logger {
  private static instance: Logger;
  private winstonLogger = winston.createLogger({});
  private config: LoggerConfig;
  private currentContext: LogContext = {};
  private stepCounter: number = 0;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.ensureLogDirectory();
    this.initializeWinston();
  }

  /**
   * Obtiene la instancia singleton del Logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Resetea la instancia (útil para tests)
   */
  public static resetInstance(): void {
    Logger.instance = null as any;
  }

  // ===================================
  // CONFIGURACIÓN
  // ===================================

  /**
   * Configuración por defecto del logger
   */
  private getDefaultConfig(): LoggerConfig {
    return {
      level: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
      enableConsole: process.env.LOG_CONSOLE !== 'false',
      enableFile: process.env.LOG_FILE !== 'false',
      logDirectory: process.env.LOG_DIR || 'logs',
      maxFileSize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '14'),
      datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
      clientName: process.env.CLIENT_NAME,
      testName: process.env.TEST_NAME
    };
  }

  /**
   * Actualiza la configuración del logger
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    this.initializeWinston();
  }

  /**
   * Establece el contexto global para todos los logs
   */
  public setContext(context: LogContext): void {
    this.currentContext = { ...this.currentContext, ...context };
  }

  /**
   * Limpia el contexto actual
   */
  public clearContext(): void {
    this.currentContext = {};
    this.stepCounter = 0;
  }

  /**
   * Obtiene el contexto actual
   */
  public getContext(): LogContext {
    return { ...this.currentContext };
  }

  // ===================================
  // INICIALIZACIÓN
  // ===================================

  /**
   * Asegura que el directorio de logs existe
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.config.logDirectory)) {
      fs.mkdirSync(this.config.logDirectory, { recursive: true });
    }

    // Crear subdirectorios por cliente si aplica
    if (this.config.clientName) {
      const clientLogDir = path.join(this.config.logDirectory, this.config.clientName);
      if (!fs.existsSync(clientLogDir)) {
        fs.mkdirSync(clientLogDir, { recursive: true });
      }
    }
  }

  /**
   * Inicializa Winston con la configuración actual
   */
  private initializeWinston(): void {
    const transports: winston.transport[] = [];

    // Transporte de consola
    if (this.config.enableConsole) {
      transports.push(
        new winston.transports.Console({
          level: this.config.level,
          format: this.getConsoleFormat()
        })
      );
    }

    // Transportes de archivo
    if (this.config.enableFile) {
      // Archivo de todos los logs
      transports.push(
        new winston.transports.File({
          filename: this.getLogFilePath('combined'),
          level: this.config.level,
          format: this.getFileFormat(),
          maxsize: this.parseFileSize(this.config.maxFileSize),
          maxFiles: this.config.maxFiles
        })
      );

      // Archivo específico para errores
      transports.push(
        new winston.transports.File({
          filename: this.getLogFilePath('error'),
          level: LogLevel.ERROR,
          format: this.getFileFormat(),
          maxsize: this.parseFileSize(this.config.maxFileSize),
          maxFiles: this.config.maxFiles
        })
      );

      // Archivo específico para debug (solo en modo debug)
      if (this.config.level === LogLevel.DEBUG) {
        transports.push(
          new winston.transports.File({
            filename: this.getLogFilePath('debug'),
            level: LogLevel.DEBUG,
            format: this.getFileFormat(),
            maxsize: this.parseFileSize(this.config.maxFileSize),
            maxFiles: this.config.maxFiles
          })
        );
      }
    }

    this.winstonLogger = winston.createLogger({
      level: this.config.level,
      transports,
      // No salir en errores no manejados
      exitOnError: false
    });
  }

  /**
   * Formato para logs en consola (más legible)
   */
  private getConsoleFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
      winston.format.colorize({ all: true }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const contextStr = this.formatContextForConsole(meta);
        return `${timestamp} [${level}]: ${message}${contextStr}`;
      })
    );
  }

  /**
   * Formato para logs en archivo (más estructurado)
   */
  private getFileFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );
  }

  /**
   * Formatea el contexto para mostrar en consola
   */
  private formatContextForConsole(meta: any): string {
    const context = { ...this.currentContext, ...meta };
    delete context.timestamp;
    delete context.level;
    delete context.message;

    if (Object.keys(context).length === 0) return '';

    const contextParts: string[] = [];
    
    if (context.clientName) contextParts.push(`client:${context.clientName}`);
    if (context.testName) contextParts.push(`test:${context.testName}`);
    if (context.stepNumber) contextParts.push(`step:${context.stepNumber}`);
    if (context.selector) contextParts.push(`selector:${context.selector}`);
    if (context.url) contextParts.push(`url:${context.url}`);
    if (context.duration) contextParts.push(`duration:${context.duration}ms`);

    return contextParts.length > 0 ? ` [${contextParts.join(', ')}]` : '';
  }

  /**
   * Obtiene la ruta del archivo de log
   */
  private getLogFilePath(type: string): string {
    const dateStr = moment().format(this.config.datePattern);
    const clientPrefix = this.config.clientName ? `${this.config.clientName}-` : '';
    const filename = `${clientPrefix}${type}-${dateStr}.log`;
    
    if (this.config.clientName) {
      return path.join(this.config.logDirectory, this.config.clientName, filename);
    }
    
    return path.join(this.config.logDirectory, filename);
  }

  /**
   * Convierte string de tamaño a bytes
   */
  private parseFileSize(size: string): number {
    const units: { [key: string]: number } = {
      'b': 1,
      'k': 1024,
      'm': 1024 * 1024,
      'g': 1024 * 1024 * 1024
    };

    const match = size.toLowerCase().match(/^(\d+)([bkmg]?)$/);
    if (!match) return 10 * 1024 * 1024; // 10MB por defecto

    const value = parseInt(match[1]);
    const unit = match[2] || 'b';
    return value * units[unit];
  }

  // ===================================
  // MÉTODOS DE LOGGING PÚBLICOS
  // ===================================

  /**
   * Log de nivel ERROR
   */
  public error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Log de nivel WARN
   */
  public warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log de nivel INFO
   */
  public info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log de nivel DEBUG
   */
  public debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Método genérico de logging
   */
  public log(level: LogLevel, message: string, context?: LogContext): void {
    const logContext = {
      ...this.currentContext,
      ...context,
      timestamp: moment().toISOString()
    };

    this.winstonLogger.log(level, message, logContext);
  }

  // ===================================
  // MÉTODOS ESPECIALIZADOS
  // ===================================

  /**
   * Log de inicio de test
   */
  public startTest(testName: string, context?: LogContext): void {
    this.stepCounter = 0;
    this.setContext({ testName, ...context });
    this.info(`🚀 Starting test: ${testName}`, { 
      event: 'test_start',
      testName,
      ...context 
    });
  }

  /**
   * Log de fin de test
   */
  public endTest(testName: string, status: 'passed' | 'failed' | 'skipped', duration?: number): void {
    const emoji = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️';
    const level = status === 'failed' ? LogLevel.ERROR : LogLevel.INFO;
    
    this.log(level, `${emoji} Test ${status}: ${testName}`, {
    event: 'test_end',
    testName,
    status,
    duration: duration?.toString(),     
    totalSteps: this.stepCounter.toString()
    });
    
    this.clearContext();
  }

  /**
   * Log de paso de test
   */
  public step(description: string, context?: LogContext): void {
    this.stepCounter++;
    this.info(`📝 Step ${this.stepCounter}: ${description}`, {
      event: 'test_step',

      stepNumber: this.stepCounter.toString(),
      stepDescription: description,
      ...context
    });
  }

  /**
   * Log de acción en elemento
   */
  public action(action: string, selector: string, value?: string, context?: LogContext): void {
    const message = value 
      ? `🔧 ${action} on '${selector}' with value '${value}'`
      : `🔧 ${action} on '${selector}'`;
      
    this.info(message, {
      event: 'action',
      action,
      selector,
      value,
      ...context
    });
  }

  /**
   * Log de navegación
   */
  public navigation(url: string, context?: LogContext): void {
    this.info(`🌐 Navigating to: ${url}`, {
      event: 'navigation',
      url,
      ...context
    });
  }

  /**
   * Log de espera
   */
  public wait(condition: string, timeout: number, context?: LogContext): void {
    this.debug(`⏳ Waiting for: ${condition} (timeout: ${timeout}ms)`, {
      event: 'wait',
      condition,
      timeout,
      ...context
    });
  }

  /**
   * Log de verificación/assertion
   */
  public assertion(description: string, result: boolean, expected?: any, actual?: any): void {
    const emoji = result ? '✅' : '❌';
    const level = result ? LogLevel.INFO : LogLevel.ERROR;
    
    this.log(level, `${emoji} Assertion: ${description}`, {
      event: 'assertion',
      result,
      expected,
      actual
    });
  }

  /**
   * Log de captura de pantalla
   */
  public screenshot(path: string, description?: string, context?: LogContext): void {
    this.info(`📸 Screenshot taken: ${description || 'Screenshot'}`, {
      event: 'screenshot',
      screenshotPath: path,
      description,
      ...context
    });
  }

  /**
   * Log de error con stack trace
   */
  public exception(error: Error, context?: LogContext): void {
    this.error(`💥 Exception: ${error.message}`, {
      event: 'exception',
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
      ...context
    });
  }

  /**
   * Log de performance
   */
  public performance(operation: string, duration: number, context?: LogContext): void {
    const level = duration > 5000 ? LogLevel.WARN : LogLevel.INFO;
    const emoji = duration > 5000 ? '🐌' : '⚡';
    
    this.log(level, `${emoji} Performance: ${operation} took ${duration}ms`, {
      event: 'performance',
      operation,
      duration: duration?.toString(),
      ...context
    });
  }

  /**
   * Log de datos de test
   */
  public data(description: string, data: any, context?: LogContext): void {
    this.debug(`📊 Test data: ${description}`, {
      event: 'test_data',
      description,
      data: JSON.stringify(data, null, 2),
      ...context
    });
  }

  // ===================================
  // MÉTODOS DE UTILIDAD
  // ===================================

  /**
   * Verifica si un nivel está habilitado
   */
  public isLevelEnabled(level: LogLevel): boolean {
    const levels = {
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 1,
      [LogLevel.INFO]: 2,
      [LogLevel.DEBUG]: 3
    };

    return levels[level] <= levels[this.config.level];
  }

  /**
   * Obtiene estadísticas de logging
   */
  public getStats(): { [level: string]: number } {
    // Winston no expone estadísticas directamente, pero podemos implementar un contador
    return {
      info: 0, // Implementar si es necesario
      warn: 0,
      error: 0,
      debug: 0
    };
  }

  /**
   * Cierra todos los transportes (útil para tests)
   */
public close(): Promise<void> {
    this.winstonLogger.close();
    return Promise.resolve();
    }

  /**
   * Crea un logger hijo con contexto específico
   */
  public child(context: LogContext): ChildLogger {
    return new ChildLogger(this, context);
  }

  // ===================================
  // MÉTODOS DE ANÁLISIS
  // ===================================

  /**
   * Obtiene logs de un archivo específico
   */
public async getLogsFromFile(date: string, type: 'combined' | 'error' | 'debug' = 'combined'): Promise<string[]> {
  const filePath = this.getLogFilePathForDate(type, date);
  
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.split('\n').filter(line => line.trim() !== '');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.error(`Failed to read log file: ${filePath}`, { error: errorMessage });
  }
  
  return [];
}
  /**
   * Obtiene la ruta del archivo de log para una fecha específica
   */
  private getLogFilePathForDate(type: string, date: string): string {
    const clientPrefix = this.config.clientName ? `${this.config.clientName}-` : '';
    const filename = `${clientPrefix}${type}-${date}.log`;
    
    if (this.config.clientName) {
      return path.join(this.config.logDirectory, this.config.clientName, filename);
    }
    
    return path.join(this.config.logDirectory, filename);
  }

  /**
   * Limpia logs antiguos
   */
public cleanOldLogs(daysToKeep: number = 30): number {
  let deletedCount = 0;
  const cutoffDate = moment().subtract(daysToKeep, 'days');
  
  try {
    const logDir = this.config.clientName 
      ? path.join(this.config.logDirectory, this.config.clientName)
      : this.config.logDirectory;
      
    const files = fs.readdirSync(logDir);
    
    for (const file of files) {
      if (file.endsWith('.log')) {
        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);
        
        if (moment(stats.mtime).isBefore(cutoffDate)) {
          fs.unlinkSync(filePath);
          deletedCount++;
          this.info(`Deleted old log file: ${file}`);
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.error(`Failed to clean old logs: ${errorMessage}`);
  }
  
  return deletedCount;
}
}

/**
 * Logger hijo que mantiene contexto específico
 */
export class ChildLogger {
  constructor(
    private parentLogger: Logger,
    private childContext: LogContext
  ) {}

  public error(message: string, context?: LogContext): void {
    this.parentLogger.error(message, { ...this.childContext, ...context });
  }

  public warn(message: string, context?: LogContext): void {
    this.parentLogger.warn(message, { ...this.childContext, ...context });
  }

  public info(message: string, context?: LogContext): void {
    this.parentLogger.info(message, { ...this.childContext, ...context });
  }

  public debug(message: string, context?: LogContext): void {
    this.parentLogger.debug(message, { ...this.childContext, ...context });
  }

  public step(description: string, context?: LogContext): void {
    this.parentLogger.step(description, { ...this.childContext, ...context });
  }

  public action(action: string, selector: string, value?: string, context?: LogContext): void {
    this.parentLogger.action(action, selector, value, { ...this.childContext, ...context });
  }

  public assertion(description: string, result: boolean, expected?: any, actual?: any): void {
    this.parentLogger.assertion(description, result, expected, actual);
  }

  public screenshot(path: string, description?: string, context?: LogContext): void {
    this.parentLogger.screenshot(path, description, { ...this.childContext, ...context });
  }
}

// Exportar instancia por defecto para facilidad de uso
export const logger = Logger.getInstance();