import { defineConfig, devices } from "@playwright/test";

const URL_BASE = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/parcours",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: URL_BASE,
    trace: "on-first-retry",
  },
  projects: [
    { name: "bureau", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npm run build && npm run start -- --port 3100",
    url: URL_BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
