import { Page } from '@playwright/test';

export class WaitUtils {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForElement(selector: string, timeout: number = 30000): Promise<void> {
    await this.page.waitForSelector(selector, { timeout });
  }

  async waitForElementToBeVisible(selector: string, timeout: number = 30000): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  async waitForElementToBeHidden(selector: string, timeout: number = 30000): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  async waitForText(selector: string, text: string, timeout: number = 30000): Promise<void> {
    await this.page.waitForFunction(
      ({ selector, text }) => {
        const element = document.querySelector(selector);
        return element && element.textContent?.includes(text);
      },
      { selector, text },
      { timeout }
    );
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForURL(url: string | RegExp, timeout: number = 30000): Promise<void> {
    await this.page.waitForURL(url, { timeout });
  }
}
