import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    { command: 'pnpm --filter @eazo/ideal-day-lab dev --host 127.0.0.1', port: 5101, reuseExistingServer: true },
    { command: 'pnpm --filter @eazo/scroll-to-space dev --host 127.0.0.1', port: 5102, reuseExistingServer: true },
    { command: 'pnpm --filter @eazo/life-elsewhere-now dev --host 127.0.0.1', port: 5103, reuseExistingServer: true },
    { command: 'pnpm --filter @eazo/who-shared-the-year dev --host 127.0.0.1', port: 5104, reuseExistingServer: true },
    { command: 'pnpm --filter @eazo/weird-matter-lab dev --host 127.0.0.1', port: 5105, reuseExistingServer: true },
  ],
  projects: [
    ...[
      ['day', 5101], ['space', 5102], ['life', 5103], ['year', 5104], ['lab', 5105],
    ].flatMap(([app, port]) => [
      { name: `${app}-pixel`, metadata: { app }, use: { ...devices['Pixel 7'], baseURL: `http://127.0.0.1:${port}` } },
      { name: `${app}-iphone`, metadata: { app }, use: { ...devices['iPhone 12'], baseURL: `http://127.0.0.1:${port}` } },
    ]),
    { name: 'day-tablet', metadata: { app: 'day' }, use: { ...devices['iPad Pro 11'], baseURL: 'http://127.0.0.1:5101' } },
    { name: 'day-desktop', metadata: { app: 'day' }, use: { viewport: { width: 1440, height: 1000 }, baseURL: 'http://127.0.0.1:5101' } },
  ],
});
