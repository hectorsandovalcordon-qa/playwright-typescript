import * as dotenv from 'dotenv';
import { Environment } from './Environment';
import { ClientConfig } from './ClientConfig';

dotenv.config();

export class Config {
  private static instance: Config;
  private environment: Environment;
  private clientConfig: ClientConfig | null = null;

  private constructor() {
    this.environment = new Environment();
  }

  public static getInstance(): Config {
    if (Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public setClientConfig(clientConfig: ClientConfig): void {
    this.clientConfig = clientConfig;
  }

  public getClientConfig(): ClientConfig | null {
    return this.clientConfig;
  }

  public getBaseUrl(): string {
    return this.clientConfig?.baseUrl || this.environment.getBaseUrl();
  }

  public getTimeout(): number {
    return this.clientConfig?.timeout || this.environment.getTimeout();
  }

  public getBrowser(): string {
    return this.environment.getBrowser();
  }

  public getHeadless(): boolean {
    return this.environment.getHeadless();
  }

  public getClientName(): string {
    return this.clientConfig?.name || 'default';
  }

  public getReportsPath(): string {
    return `reports/${this.getClientName()}`;
  }
}
