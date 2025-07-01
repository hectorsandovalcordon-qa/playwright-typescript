import { Page } from '@playwright/test';
import { BasePage } from '../../../core/base/BasePage';
import { ClientConfig } from '../../../core/config/ClientConfig';

export class LoginPage extends BasePage {
  private selectors: Record<string, string>;

  constructor(page: Page) {
    super(page);
    const clientConfig = this.config.getClientConfig() as ClientConfig;
    this.selectors = clientConfig.customSelectors || {};
  }

  async navigate(): Promise<void> {
    this.logger.info('Navigating to login page');
    await this.page.goto('/login');
    await this.waitForNavigation();
  }

  async login(username: string, password: string): Promise<void> {
    this.logger.info(`Attempting login with username: ${username}`);
ECHO est  desactivado.
    await this.fill(this.selectors.usernameField, username);
    await this.fill(this.selectors.passwordField, password);
    await this.click(this.selectors.loginButton);
    await this.waitForNavigation();
ECHO est  desactivado.
    this.logger.info('Login attempt completed');
  }

  async isLoaded(): Promise<boolean> {
    return await this.isVisible(this.selectors.loginButton);
  }

  async getErrorMessage(): Promise<string> {
    try {
      return await this.getText(this.selectors.errorMessage);
    } catch {
      return '';
    }
  }

  async isErrorDisplayed(): Promise<boolean> {
    return await this.isVisible(this.selectors.errorMessage);
  }
}
