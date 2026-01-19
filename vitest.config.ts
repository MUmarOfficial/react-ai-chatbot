import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    // Update this line to include .ts and .tsx
    include: ["./src/**/*.{test,spec}.{ts,tsx}"],
    globals: true,
  },
});
