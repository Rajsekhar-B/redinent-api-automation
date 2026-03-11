import { defineConfig } from '@playwright/test';
import { env } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  fullyParallel: true,
  retries: env.CI ? 2 : 0,
  workers: env.CI ? 4 : undefined,
  reporter: [
    ['line'],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    ['allure-playwright', { detail: true, suiteTitle: false }]
  ],
  use: {
    baseURL: env.BASE_URL,
    trace: 'retain-on-failure'
  }
});
