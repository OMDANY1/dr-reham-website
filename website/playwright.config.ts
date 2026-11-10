import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop-chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "mobile-chrome",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        channel: "chrome",
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
      },
    },
  ],
  webServer: {
    command: "npm run start -- -p 3000 -H 127.0.0.1",
    url: "http://127.0.0.1:3000/ar",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
