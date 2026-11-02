import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, react, next, vitest],
  rules: {
    "func-style": "off",
    "sort-keys": "off",
    "react/set-state-in-effect": "off",
    "react/static-components": "off",
    "react/immutability": "off",
    "react/refs": "off",
    "promise/prefer-await-to-then": "off",
    "no-shadow": "off",
    "jsx-a11y/prefer-tag-over-role": "off",
    "jsx-a11y/heading-has-content": "off",
    "no-empty-function": "off",
    "unicorn/prefer-logical-operator-over-ternary": "off",
    "unicorn/prefer-module": "off",
    "node/global-require": "off",
    "eslint/require-await": "off",
    "eslint/no-unused-vars": "off",
    "react/function-component-definition": "off",
    "react/no-danger": "off",
    "eslint/no-await-in-loop": "off",
    "eslint/require-unicode-regexp": "off",
    "eslint/prefer-named-capture-group": "off",
    "react/no-react-children": "off",
    "react/jsx-no-constructed-context-values": "off",
    "promise/always-return": "off",
    "react/exhaustive-effect-dependencies": "off",
  },
  overrides: [
    {
      files: ["lib/ai/**/*.ts"],
      rules: {
        "typescript/method-signature-style": "off",
        "unicorn/prefer-export-from": "off",
        "promise/avoid-new": "off",
        "eslint/no-use-before-define": "off",
        "eslint/complexity": "off",
        "eslint/no-inner-declarations": "off",
      },
    },
    {
      files: [
        "app/.well-known/agent-skills/index.json/route.ts",
        "lib/read-file.ts",
      ],
      rules: {
        "no-inline-comments": "off",
      },
    },
  ],
  ignorePatterns: [
    "public/r/**",
    "public/skills/**",
    ".agents/**",
    ".cursor/**",
    ".changeset/**",
    ".claude/**",
    ".web-kits/**",
    "audio/**",
    "registry/**",
    "cli/**",
    "scripts/**",
    "components/ui/**",
    "examples/**",
    ".source/**",
    ".next/**",
  ],
});
