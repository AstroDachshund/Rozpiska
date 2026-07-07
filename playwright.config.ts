import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

// Admin (service_role) env dla fixture'ów — te same pliki co testy RLS.
loadEnv({ path: '.env.test.local' });
loadEnv();

const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // współdzielona lokalna baza — bez równoległości między plikami
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: { baseURL, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `PORT=${PORT} npm run dev`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
