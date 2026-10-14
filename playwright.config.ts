import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 2, timeout: 45000,
  expect: { timeout: 15000 }, reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: { baseURL: process.env.APP_URL || 'http://127.0.0.1:4173/pizza-dough-calculator/', serviceWorkers: 'allow', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium-ipad', use: { ...devices['iPad Pro 11'], browserName: 'chromium' } },
    { name: 'webkit-ipad', use: { ...devices['iPad Pro 11'], browserName: 'webkit' } },
  ],
});
