import { Page } from '@playwright/test';
import * as moment from 'moment';
import { Config } from '../config/Config';

export class ScreenshotUtils {
  private page: Page;
  private config: Config;

  constructor(page: Page) {
    this.page = page;
    this.config = Config.getInstance();
  }

  async takeScreenshot(name: string): Promise<string> {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const filename = `${name}_${timestamp}.png`;
    const path = `${this.config.getReportsPath()}/screenshots/${filename}`;
ECHO est  desactivado.
    await this.page.screenshot({ 
      path,
      fullPage: true 
    });
ECHO est  desactivado.
    return path;
  }

  async takeElementScreenshot(selector: string, name: string): Promise<string> {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const filename = `${name}_element_${timestamp}.png`;
    const path = `${this.config.getReportsPath()}/screenshots/${filename}`;
ECHO est  desactivado.
    await this.page.locator(selector).screenshot({ path });
ECHO est  desactivado.
    return path;
  }
}
