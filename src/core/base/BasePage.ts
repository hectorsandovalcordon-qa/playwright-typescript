import { Page } from '@playwright/test';
import { Config } from '../config/Config';
import { Logger } from '../utils/Logger';
import { WaitUtils } from '../utils/WaitUtils';
import { ScreenshotUtils } from '../utils/ScreenshotUtils';

export abstract class BasePage {
  protected page: Page;
  protected config: Config;
  protected logger: Logger;
  protected waitUtils: WaitUtils;
  protected screenshotUtils: ScreenshotUtils;

  constructor(page: Page) {
    this.page = page;
    this.config = Config.getInstance();
    this.logger = Logger.getInstance();
    this.waitUtils = new WaitUtils(page);
    this.screenshotUtils = new ScreenshotUtils(page);
  }

  protected async click(selector: string): Promise<void> {
    this.logger.info(`Clicking on element: ${selector}`);
    await this.waitUtils.waitForElement(selector);
    await this.page.click(selector);
  }

  protected async fill(selector: string, text: string): Promise<void> {
    this.logger.info(`Filling element ${selector} with text: ${text}`);
    await this.waitUtils.waitForElement(selector);
    await this.page.fill(selector, text);
  }

  protected async getText(selector: string): Promise<string> {
    await this.waitUtils.waitForElement(selector);
    return await this.page.textContent(selector) || '';
  }

  protected async isVisible(selector: string): Promise<boolean> {
    try {
      return await this.page.isVisible(selector);
    } catch {
      return false;
    }
  }

  protected async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  protected async takeScreenshot(name: string): Promise<void> {
    await this.screenshotUtils.takeScreenshot(name);
  }

  abstract isLoaded(): Promise<boolean>;
}
