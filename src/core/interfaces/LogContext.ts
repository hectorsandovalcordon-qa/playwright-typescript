/* Contexto adicional para Logs 
*/
export interface LogContext{
    testName?: string;
    clientName?: string;
    stepNumber?: string; 
    screenshot?: string;
    url?: string;
    selector?: string;
    duration?: string;
    [key: string]: any;
}