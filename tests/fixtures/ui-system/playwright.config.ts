import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: '**/*.spec.ts', workers: 1,
  use: { baseURL: 'http://127.0.0.1:4187', browserName: 'chromium' },
  webServer: { command: 'python -m http.server 4187 --bind 127.0.0.1 --directory public', url: 'http://127.0.0.1:4187', reuseExistingServer: false },
});
