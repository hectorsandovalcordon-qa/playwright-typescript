import { test as base, Page } from '@playwright/test';
import { Config } from '../config/Config';
import { Logger } from '../utils/Logger';

type TestFixtures = {
  config: Config;
  logger: Logger;
  commonPage: Page;
};

export const test = base.extend<TestFixtures>({
  config: async ({}, use) => {
    const config = Config.getInstance();
    await use(config);
  },

  logger: async ({}, use) => {
    const logger = Logger.getInstance();
    await use(logger);
  },

  commonPage: async ({ page }, use) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    page.on('pageerror', exception => {
      console.log(`Uncaught exception: "${exception}"`);
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';