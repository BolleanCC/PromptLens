import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  projects: [
    {
      // Pure logic tests — run in Node, no browser or server needed.
      name: 'unit',
      testDir: './tests/unit',
    },
    {
      // Browser smoke tests against the running app.
      name: 'e2e',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3000' },
    },
  ],
  // Only started when the e2e project runs.
  webServer: process.env.PW_SKIP_SERVER
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
