import { LogLevel } from "@core/enums/LogLevel";

/* Configuración del Logger 
*/
export interface LoggerConfig{
    level: LogLevel;
    enableConsole: boolean;
    enableFile: boolean;
    logDirectory: string;
    maxFileSize: string;
    maxFiles: number;
    datePattern: string;
    clientName?: string;
    testName?: string;
}