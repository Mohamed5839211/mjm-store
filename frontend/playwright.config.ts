import { defineConfig, devices } from '@playwright/test';

/**
 * MJM Store — Playwright configuration.
 *
 * - Chromium is the primary browser; Firefox + WebKit are enabled as
 *   secondary projects (run with --project=chromium to limit to Chromium).
 * - Servers are reused when already running locally (ports 3001/3002).
 * - Tests run serially (workers: 1) to avoid conflicts on shared data.
 * - Credentials are read from env vars, never hard-coded in specs.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002';

export default defineConfig({
  testDir: './tests',

  globalSetup: './tests/global-setup.ts',

  timeout: 30_000,
  expect: { timeout: 10_000 },

  // Serial execution: shared products/cart data must not be touched in parallel.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  webServer: [
    {
      command: 'npm run start:dev',
      cwd: '../backend',
      url: 'http://localhost:3001/api/docs',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev -- -p 3002',
      url: 'http://localhost:3002',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
