"use client";
export type {
  TextMorphProps as TextFlipProps,
  TextMorphVariant as TextFlipVariant,
} from "./text-morph";
// Compat shim: changelog/2026-11-05.mdx imports legacy TextFlip.
// Source of truth is text-morph.tsx. Delete when the changelog entry is archived.
export { TextMorph as TextFlip } from "./text-morph";
