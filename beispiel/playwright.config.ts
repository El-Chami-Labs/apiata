import { defineConfig } from "@playwright/test";

// Prüft immer den lokalen Build (npm run build vorher). Wiederholung 1: grün in der Wiederholung heißt „wackelt“.
const port = 4321;
const kernUndAblauf = /(kern|ablauf)\.spec\.ts$/;

export default defineConfig({
  testDir: "tests/e2e",
  retries: 1,
  fullyParallel: true,
  reporter: "line",
  use: { baseURL: `http://127.0.0.1:${port}` },
  webServer: {
    command: `npx astro preview --port ${port} --host 127.0.0.1 --ignore-lock`,
    port,
    reuseExistingServer: !process.env["CI"],
    timeout: 60_000,
  },
  projects: [
    { name: "handy", testMatch: kernUndAblauf, use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "desktop", testMatch: kernUndAblauf, use: { viewport: { width: 1280, height: 800 } } },
    { name: "layout", testMatch: /layout\.spec\.ts$/ },
    { name: "messung", testMatch: /\.messung\.spec\.ts$/, retries: 0 },
  ],
});
