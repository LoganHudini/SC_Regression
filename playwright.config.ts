import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  timeout: 120000,

  expect: {
    timeout: 30000,
  },

  use: {
    headless: false,
    viewport: { width: 1440, height: 810 },
    ignoreHTTPSErrors: true,
    launchOptions: { args: ['--window-size=1440,810'] },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 810 },
      },
    },
  ],
});