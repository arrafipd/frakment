import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, react, next, vitest],
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
  overrides: [
    {
      files: ["lib/ai/**/*.ts"],
      rules: {
        "eslint/complexity": "off",
        "eslint/no-inner-declarations": "off",
        "eslint/no-use-before-define": "off",
        "promise/avoid-new": "off",
        "typescript/method-signature-style": "off",
        "unicorn/prefer-export-from": "off",
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
  rules: {
    "eslint/no-await-in-loop": "off",
    "eslint/no-unused-vars": "off",
    "eslint/prefer-named-capture-group": "off",
    "eslint/require-await": "off",
    "eslint/require-unicode-regexp": "off",
    "func-style": "off",
    "jsx-a11y/heading-has-content": "off",
    "jsx-a11y/prefer-tag-over-role": "off",
    "no-empty-function": "off",
    "no-shadow": "off",
    "node/global-require": "off",
    "promise/always-return": "off",
    "promise/prefer-await-to-then": "off",
    "react/exhaustive-effect-dependencies": "off",
    "react/function-component-definition": "off",
    "react/immutability": "off",
    "react/jsx-no-constructed-context-values": "off",
    "react/no-danger": "off",
    "react/no-react-children": "off",
    "react/refs": "off",
    "react/set-state-in-effect": "off",
    "react/static-components": "off",
    "sort-keys": "off",
    "unicorn/prefer-logical-operator-over-ternary": "off",
    "unicorn/prefer-module": "off",
  },
});
