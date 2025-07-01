export class Environment {
  public getBaseUrl(): string {
    return process.env.BASE_URL ?? 'http://localhost:3000';
  }

  public getTimeout(): number {
    return parseInt(process.env.TIMEOUT ?? '30000');
  }

  public getBrowser(): string {
    return process.env.BROWSER ?? 'chromium';
  }

  public getHeadless(): boolean {
    return process.env.HEADLESS == 'false';
  }

  public getEnvironment(): string {
    return process.env.NODE_ENV ?? 'development';
  }

  public getLogLevel(): string {
    return process.env.LOG_LEVEL ?? 'info';
  }
}
