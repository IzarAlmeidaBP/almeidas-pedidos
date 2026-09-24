import { defineConfig, devices } from "@playwright/test";

const PORTA = 4173;
const celular = { isMobile: true, hasTouch: true, deviceScaleFactor: 3 };

/**
 * Testes de ponta a ponta no site já compilado (npm run build + preview).
 * - Fluxo e layout: 360, 390 (WebKit, motor do Safari/iPhone), 768 e 1440px.
 * - Visual: 320px, 1920px e celular deitado (capturas em test-results/).
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORTA}`,
    locale: "pt-BR",
    timezoneId: "America/Fortaleza",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORTA} --strictPort`,
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    {
      name: "celular-360",
      testIgnore: /visual\.spec/,
      use: { browserName: "chromium", viewport: { width: 360, height: 740 }, ...celular },
    },
    {
      name: "celular-390-webkit",
      testIgnore: /visual\.spec/,
      use: { ...devices["iPhone 13"], viewport: { width: 390, height: 664 } },
    },
    {
      name: "tablet-768",
      testIgnore: /visual\.spec/,
      use: {
        browserName: "chromium",
        viewport: { width: 768, height: 1024 },
        hasTouch: true,
        deviceScaleFactor: 2,
      },
    },
    {
      name: "desktop-1440",
      testIgnore: /visual\.spec/,
      use: { browserName: "chromium", viewport: { width: 1440, height: 900 } },
    },
    {
      name: "visual",
      testMatch: /visual\.spec/,
      use: { browserName: "chromium" },
    },
  ],
});
