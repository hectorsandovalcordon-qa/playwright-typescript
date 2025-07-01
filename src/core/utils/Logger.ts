import * as winston from 'winston';
import * as moment from 'moment';

export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ level, message, timestamp }) => {
          return `${moment(timestamp).format('YYYY-MM-DD HH:mm:ss')} [${level.toUpperCase()}]: ${message}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ 
          filename: `logs/error-${moment().format('YYYY-MM-DD')}.log`, 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: `logs/combined-${moment().format('YYYY-MM-DD')}.log` 
        })
      ]
    });
  }

  public static getInstance(): Logger {
    if (Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string): void {
    this.logger.info(message);
  }

  public error(message: string): void {
    this.logger.error(message);
  }

  public warn(message: string): void {
    this.logger.warn(message);
  }

  public debug(message: string): void {
    this.logger.debug(message);
  }
}
