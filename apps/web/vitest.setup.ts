import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import * as matchers from "vitest-axe/matchers";

// jsdom lacks ResizeObserver (used by Trace, Accordion).
if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverPolyfill {
    observe() {
      return this;
    }
    unobserve() {
      return this;
    }
    disconnect() {
      return this;
    }
  }
  globalThis.ResizeObserver =
    ResizeObserverPolyfill as unknown as typeof ResizeObserver;
}

expect.extend(matchers);
