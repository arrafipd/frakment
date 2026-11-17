// Type augmentation for vitest-axe matchers.
// Required because vitest-axe still augments the retired `Vi.Assertion`
// namespace. We re-declare the matchers on the current `vitest` module.
// Ref: https://github.com/chaance/vitest-axe#with-typescript

import "vitest";
import type { AxeMatchers } from "vitest-axe/matchers";

declare module "vitest" {
  export interface Assertion extends AxeMatchers {}
  export interface AsymmetricMatchersContaining extends AxeMatchers {}
}
