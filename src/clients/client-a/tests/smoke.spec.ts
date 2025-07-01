import { test, expect } from '../../../core/base/BaseTest';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

test.describe('Client A - Smoke Tests', () => {
  test('should load home page correctly', async ({ commonPage, logger }) => {
    logger.info('Running home page smoke test');
ECHO est  desactivado.
    const homePage = new HomePage(commonPage);
    await homePage.navigate();
ECHO est  desactivado.
    expect(await homePage.isLoaded()).toBeTruthy();
ECHO est  desactivado.
    const title = await homePage.getPageTitle();
    expect(title).toBeTruthy();
ECHO est  desactivado.
    logger.info(`Home page loaded with title: ${title}`);
  });

  test('should load login page correctly', async ({ commonPage, logger }) => {
    logger.info('Running login page smoke test');
ECHO est  desactivado.
    const loginPage = new LoginPage(commonPage);
    await loginPage.navigate();
ECHO est  desactivado.
    expect(await loginPage.isLoaded()).toBeTruthy();
ECHO est  desactivado.
    logger.info('Login page loaded successfully');
  });

  test('should have responsive design', async ({ commonPage, logger }) => {
    logger.info('Testing responsive design');
ECHO est  desactivado.
    const homePage = new HomePage(commonPage);
    await homePage.navigate();
ECHO est  desactivado.
    await commonPage.setViewportSize({ width: 375, height: 667 });
    expect(await homePage.isLoaded()).toBeTruthy();
ECHO est  desactivado.
    await commonPage.setViewportSize({ width: 768, height: 1024 });
    expect(await homePage.isLoaded()).toBeTruthy();
ECHO est  desactivado.
    await commonPage.setViewportSize({ width: 1920, height: 1080 });
ECHO est  desactivado.
    logger.info('Responsive design test completed');
  });
});
