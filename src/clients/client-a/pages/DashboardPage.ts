import { Page } from '@playwright/test';
import { BasePage } from '../../../core/base/BasePage';
import { ClientConfig } from '../../../core/config/ClientConfig';

export class DashboardPage extends BasePage {
  private selectors: Record<string, string>;

  constructor(page: Page) {
    super(page);
    const clientConfig = this.config.getClientConfig() as ClientConfig;
    this.selectors = clientConfig.customSelectors || {};
  }

  async isLoaded(): Promise<boolean> {
    return await this.isVisible(this.selectors.dashboard);
  }

  async getUserName(): Promise<string> {
    return await this.getText(this.selectors.userName);
  }

  async getWelcomeMessage(): Promise<string> {
    return await this.getText(this.selectors.welcomeMessage);
  }

  async navigateToSection(section: string): Promise<void> {
    this.logger.info(`Navigating to section: ${section}`);
    await this.click(`[data-section="${section}"]`);
    await this.waitForNavigation();
  }

  async logout(): Promise<void> {
    this.logger.info('Logging out');
    await this.click(this.selectors.logoutButton);
    await this.waitForNavigation();
  }

  async isWelcomeMessageVisible(): Promise<boolean> {
    return await this.isVisible(this.selectors.welcomeMessage);
  }

  async waitForDashboardLoad(): Promise<void> {
    await this.waitUtils.waitForElementToBeVisible(this.selectors.dashboard);
    await this.logger.info('Dashboard loaded successfully');
  }
}
