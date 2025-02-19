import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'playwright',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'html',
  use: {
    headless: true,
    baseURL: 'http://127.0.0.1:9090',
    video: 'retain-on-failure',
    trace: 'on-first-retry',

    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
