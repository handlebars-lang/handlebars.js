const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testMatch: ['spec.js'],
  use: {
    baseURL: 'http://localhost:9999'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  reporter: 'list',
  webServer: {
    command: 'node server.js',
    port: 9999,
    reuseExistingServer: false
  }
};

module.exports = config;
