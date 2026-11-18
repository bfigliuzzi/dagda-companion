import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  forbidOnly: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173",
    serviceWorkers: "allow",
  },
  projects: [{ name: "pixel-7", use: { ...devices["Pixel 7"] } }],
  webServer: {
    command:
      // Mode test : l'app lit la graine de dés de l'adresse (voir src/lib/des.ts).
      "npm run build -- --mode test && npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
