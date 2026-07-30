import { defineConfig } from '@playwright/test';

/**
 * Playwright Configuration for Security Tests
 * Runs E2E security tests against the development server
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /security-.*\.spec\.ts/,
  
  fullyParallel: false, // Security tests should run sequentially
  forbidOnly: !!process.env.CI, // Fail on .only() in CI
  retries: process.env.CI ? 1 : 0,
  
  reporter: [
    ['html', { outputFolder: 'playwright-report/security' }],
    ['json', { outputFile: 'playwright-report/security/results.json' }],
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
