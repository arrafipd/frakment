import { describe, expect, it } from "vitest";

import { phosphorIcons, simpleIcons } from "../icon";

describe("icon registry", () => {
  it("has registered Phosphor icons", () => {
    expect(Object.keys(phosphorIcons).length).toBeGreaterThan(0);
  });

  it("has registered Simple icons", () => {
    expect(Object.keys(simpleIcons).length).toBeGreaterThan(0);
  });

  it("has no name overlap between registries", () => {
    const phosphorNames = new Set(Object.keys(phosphorIcons));
    const overlap = Object.keys(simpleIcons).filter((n) =>
      phosphorNames.has(n)
    );
    expect(overlap).toEqual([]);
  });

  it("all Phosphor keys are lowercase kebab-case", () => {
    for (const name of Object.keys(phosphorIcons)) {
      expect(name).toMatch(/^[a-z]+(-[a-z]+)*$/u);
    }
  });

  it("all Simple keys are lowercase kebab-case", () => {
    for (const name of Object.keys(simpleIcons)) {
      expect(name).toMatch(/^[a-z]+(-[a-z]+)*$/u);
    }
  });
});
