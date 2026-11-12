import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
    globals: true,
    include: ["packages/**/*.{test,spec}.{ts,tsx,js,mjs}"],
  },
});
