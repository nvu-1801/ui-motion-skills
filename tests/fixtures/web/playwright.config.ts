import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: '**/quality.spec.ts',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4179', browserName: 'chromium' },
  webServer: { command: 'python -m http.server 4179 --bind 127.0.0.1', url: 'http://127.0.0.1:4179', reuseExistingServer: false },
});
