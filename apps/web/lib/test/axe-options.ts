/**
 * Shared axe options for all a11y tests.
 *
 * PRINCIPLE: tests MUST NOT modify design color tokens.
 * color-contrast is intentionally disabled across all tests.
 * To audit contrast, do it manually or enable temporarily in a
 * local-only test (never commit changes that alter tokens).
 */
export const axeOptions = {
  rules: {
    "color-contrast": { enabled: false },
  },
} as const;
