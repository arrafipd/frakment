import { describe, expect, it } from "vitest";

import { requestOrigin } from "./request-origin";

describe("requestOrigin", () => {
  it("uses the request URL instead of client-controlled forwarding headers", () => {
    const request = new Request("https://www.arrafi.dev/frakment/llms.txt", {
      headers: {
        "x-forwarded-host": "attacker.example",
        "x-forwarded-proto": "http",
      },
    });

    expect(requestOrigin(request)).toBe("https://www.arrafi.dev");
  });
});
