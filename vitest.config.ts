import { defineConfig } from "vitest/config";

/**
 * Vitest config. Minimal by design — the `@/` alias mirrors
 * tsconfig.json paths so test imports match app imports.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": process.cwd(),
    },
  },
  test: {
    environment: "node",
  },
});
