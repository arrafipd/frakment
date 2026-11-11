import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
  test: {
    coverage: {
      exclude: [
        "**/node_modules/**",
        "**/.next/**",
        "**/*.config.*",
        "**/*.d.ts",
        "**/examples/**",
      ],
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        branches: 35,
        functions: 45,
        lines: 38,
        statements: 38,
      },
    },
    environment: "jsdom",
    exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/e2e/**"],
    globals: true,
    include: ["**/*.{test,spec}.{ts,tsx,js,mjs}"],
    pool: "vmThreads",
    setupFiles: ["./vitest.setup.ts"],
  },
});
