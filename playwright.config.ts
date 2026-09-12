import { defineConfig, devices } from "@playwright/test";

/**
 * Par défaut la suite construit et sert l'application localement.
 * En renseignant URL_CIBLE, elle se joue contre un déploiement existant,
 * ce qui permet de vérifier une mise en ligne avec les mêmes scénarios.
 */
const URL_LOCALE = "http://127.0.0.1:3100";
const URL_CIBLE = process.env.URL_CIBLE;

export default defineConfig({
  testDir: "./tests/parcours",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: URL_CIBLE ?? URL_LOCALE,
    trace: "on-first-retry",
  },
  projects: [
    { name: "bureau", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: URL_CIBLE
    ? undefined
    : {
        command: "npm run build && npm run start -- --port 3100",
        url: URL_LOCALE,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
