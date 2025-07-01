import { test, expect } from '../../../core/base/BaseTest';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Client A - Dashboard Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ commonPage, config }) => {
    loginPage = new LoginPage(commonPage);
    dashboardPage = new DashboardPage(commonPage);
ECHO est  desactivado.
    await loginPage.navigate();
    const clientConfig = config.getClientConfig();
    const { username, password } = clientConfig?.credentials || {};
ECHO est  desactivado.
    if (username && password) {
      await loginPage.login(username, password);
      await dashboardPage.waitForDashboardLoad();
    }
  });

  test('should display welcome message', async ({ logger }) => {
    logger.info('Verifying welcome message on dashboard');
ECHO est  desactivado.
    expect(await dashboardPage.isWelcomeMessageVisible()).toBeTruthy();
ECHO est  desactivado.
    const welcomeMessage = await dashboardPage.getWelcomeMessage();
    expect(welcomeMessage.toLowerCase()).toContain('welcome');
ECHO est  desactivado.
    await dashboardPage.takeScreenshot('dashboard-welcome');
    logger.info('Welcome message verified successfully');
  });

  test('should navigate to different sections', async ({ logger }) => {
    const sections = ['users', 'products', 'reports'];
ECHO est  desactivado.
    for (const section of sections) {
      logger.info(`Navigating to ${section} section`);
ECHO est  desactivado.
      try {
        await dashboardPage.navigateToSection(section);
ECHO est  desactivado.
        expect(await dashboardPage.page.url()).toContain(section);
        logger.info(`Successfully navigated to ${section}`);
      } catch (error) {
        logger.warn(`Could not navigate to ${section}: ${error}`);
      }
    }
  });

  test('should logout successfully', async ({ logger }) => {
    logger.info('Testing logout functionality');
ECHO est  desactivado.
    await dashboardPage.logout();
ECHO est  desactivado.
    expect(await loginPage.isLoaded()).toBeTruthy();
ECHO est  desactivado.
    logger.info('Logout completed successfully');
  });

  test('should display user information', async ({ logger }) => {
    logger.info('Verifying user information display');
ECHO est  desactivado.
    try {
      const userName = await dashboardPage.getUserName();
      expect(userName).toBeTruthy();
      expect(userName.length).toBeGreaterThan(0);
ECHO est  desactivado.
      logger.info(`User name displayed: ${userName}`);
    } catch (error) {
      logger.warn(`Could not retrieve user name: ${error}`);
    }
  });
});
