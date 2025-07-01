import { test, expect } from '../../../core/base/BaseTest';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DataUtils } from '../../../core/utils/DataUtils';

test.describe('Client A - Login Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ commonPage }) => {
    loginPage = new LoginPage(commonPage);
    dashboardPage = new DashboardPage(commonPage);
    await loginPage.navigate();
  });

  test('should login with valid credentials', async ({ config, logger }) => {
    logger.info('Starting login test with valid credentials');
ECHO est  desactivado.
    const clientConfig = config.getClientConfig();
    const { username, password } = clientConfig?.credentials || {};
ECHO est  desactivado.
    if (password) {
      throw new Error('Client credentials not configured');
    }

    await loginPage.login(username, password);
ECHO est  desactivado.
    await expect(dashboardPage.isLoaded()).resolves.toBeTruthy();
    logger.info('Login successful - dashboard loaded');
  });

  test('should show error with invalid credentials', async ({ logger }) => {
    logger.info('Testing login with invalid credentials');
ECHO est  desactivado.
    await loginPage.login('invalid@email.com', 'wrongpassword');
ECHO est  desactivado.
    expect(await loginPage.isErrorDisplayed()).toBeTruthy();
ECHO est  desactivado.
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage.toLowerCase()).toContain('invalid');
ECHO est  desactivado.
    logger.info('Error message displayed correctly');
  });

  test('should handle empty credentials', async ({ logger }) => {
    logger.info('Testing login with empty credentials');
ECHO est  desactivado.
    await loginPage.login('', '');
ECHO est  desactivado.
    expect(await dashboardPage.isLoaded()).toBeFalsy();
ECHO est  desactivado.
    logger.info('Empty credentials handled correctly');
  });

  test('should handle special characters in password', async ({ config, logger }) => {
    logger.info('Testing login with special characters');
ECHO est  desactivado.
    const testData = DataUtils.loadTestData('src/clients/client-a/data/testdata.json');
ECHO est  desactivado.
    await loginPage.login(testData.specialUser.username, testData.specialUser.password);
ECHO est  desactivado.
    logger.info('Special characters test completed');
  });
});
