import { defineConfig, devices } from '@playwright/test';
import { env, TIMEOUTS } from './src/utils/env';

/**
 * Configuration for testing a DEPLOYED Nova Store.
 *
 * There is deliberately no `webServer` block: the application is already
 * running at a public URL, so the framework never boots anything locally.
 * Point it somewhere else with ENV, BASE_URL or API_URL.
 *
 *   npm test                    -> prod
 *   ENV=qa npm test             -> qa
 *   BASE_URL=... npm test       -> ad-hoc target
 */
export default defineConfig({
  testDir: './tests',

  // Live shared data: run serially so tests cannot interfere with one another.
  fullyParallel: false,
  workers: 1,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  // Generous, because a free-tier backend may be waking from sleep.
  timeout: 90_000,
  expect: { timeout: TIMEOUTS.assertion },

 // globalSetup: './src/utils/globalSetup.ts',

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'results/junit.xml' }],
    ['json', { outputFile: 'results/results.json' }],
  ],

  use: {
    baseURL: env.baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: TIMEOUTS.action,
    navigationTimeout: TIMEOUTS.pageLoad,

    // Headed locally for demos, headless in CI where there is no display.
    //headless: !!process.env.CI,
    headless:false,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
