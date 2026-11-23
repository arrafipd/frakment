import { describe, expect, it } from "vitest";

import { GITHUB, LINK } from "@/config/links";

describe("config/links", () => {
  it("uses the canonical repository for project links", () => {
    expect(LINK.GITHUB).toBe("https://github.com/frakment/ui");
    expect(LINK.LICENSE).toBe(
      "https://github.com/frakment/ui/blob/main/LICENSE"
    );
    expect(GITHUB.user).toBe("arrafipd");
  });
});
