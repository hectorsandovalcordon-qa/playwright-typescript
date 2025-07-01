import { defineConfig } from '@playwright/test';
import { Config } from '../../../core/config/Config';
import { ClientConfig } from '../../../core/config/ClientConfig';

const clientConfig: ClientConfig = {
  name: 'client-a',
  baseUrl: process.env.CLIENT_A_BASE_URL || 'https://client-a.example.com',
  timeout: 45000,
  credentials: {
    username: process.env.CLIENT_A_USERNAME || 'admin@client-a.com',
    password: process.env.CLIENT_A_PASSWORD || 'password123'
  },
  customSelectors: {
    loginButton: '[data-testid="login-btn"]',
    usernameField: '#username',
    passwordField: '#password',
    dashboard: '.dashboard-container',
    errorMessage: '.error-message',
    welcomeMessage: '.welcome-message',
    userName: '.user-name',
    logoutButton: '[data-testid="logout-btn"]'
  },
  apiEndpoints: {
    login: '/api/auth/login',
    users: '/api/users',
    products: '/api/products',
    logout: '/api/auth/logout'
  },
  testData: {
    validUser: {
      username: 'testuser@client-a.com',
      password: 'Test123'
    }
  }
};

Config.getInstance().setClientConfig(clientConfig);

export default defineConfig({
  testDir: '../tests',
  use: {
    baseURL: clientConfig.baseUrl,
    actionTimeout: clientConfig.timeout,
  },
  projects: [
    {
      name: 'client-a-chrome',
      use: { 
        ...require('@playwright/test').devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'client-a-firefox',
      use: { 
        ...require('@playwright/test').devices['Desktop Firefox']
      },
    }
  ]
});
