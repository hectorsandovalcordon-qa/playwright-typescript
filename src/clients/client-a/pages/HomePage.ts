import { Page } from '@playwright/test';
import { BasePage } from '../../../core/base/BasePage';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    this.logger.info('Navigating to home page');
    await this.page.goto('/');
    await this.waitForNavigation();
  }

  async isLoaded(): Promise<boolean> {
    return await this.isVisible('body');
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async clickLoginLink(): Promise<void> {
    await this.click('a[href="/login"]');
    await this.waitForNavigation();
  }
}
