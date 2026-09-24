/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    // tests/e2e é do Playwright (npm run test:e2e).
    include: ["tests/{unit,integration}/**/*.test.{ts,tsx}"],
  },
});
