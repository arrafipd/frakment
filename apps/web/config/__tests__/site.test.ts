import { describe, expect, it } from "vitest";

import { SITE } from "@/config/site";

describe("config/site", () => {
  describe("brand name (SEO)", () => {
    it("uses capital F for the user-facing NAME", () => {
      expect(SITE.NAME).toBe("Frakment");
    });

    it("uses capital F for the primary brand keyword", () => {
      expect(SITE.KEYWORDS[0]).toBe("Frakment");
    });

    it("keeps the CLI command keyword lowercase", () => {
      expect(SITE.KEYWORDS).toContain("npx frakment add");
    });

    it("does not contain a stray lowercase brand keyword", () => {
      expect(SITE.KEYWORDS).not.toContain("frakment");
    });
  });

  describe("descriptions", () => {
    it("uses the current brand description", () => {
      expect(SITE.DESCRIPTION.LONG).toBe(
        "Composable and accessible UI primitives for React and React Native with motion built in, customizable styling and AI-ready tooling."
      );
    });

    it("short description is non-empty", () => {
      expect(SITE.DESCRIPTION.SHORT.length).toBeGreaterThan(5);
    });
  });

  describe("author", () => {
    it("has a non-empty github handle", () => {
      expect(SITE.AUTHOR.NAME.length).toBeGreaterThan(0);
    });

    it("twitter handle starts with @", () => {
      expect(SITE.AUTHOR.TWITTER.startsWith("@")).toBeTruthy();
    });
  });

  describe("URLs", () => {
    it("URL is a valid absolute URL", () => {
      expect(() => new URL(SITE.URL)).not.toThrow();
    });

    it("REGISTRY is a valid absolute URL", () => {
      expect(() => new URL(SITE.REGISTRY)).not.toThrow();
    });
  });
});
