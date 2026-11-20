import { describe, expect, it } from "vitest";
import { createIdGenerator } from "../ids";

describe("createIdGenerator", () => {
  it("returns incrementing message IDs", () => {
    const gen = createIdGenerator();
    expect(gen.nextMessageId()).toBe("msg-1");
    expect(gen.nextMessageId()).toBe("msg-2");
  });
  it("supports custom prefixes", () => {
    const gen = createIdGenerator({
      messageIdPrefix: "m",
      toolCallIdPrefix: "tc",
    });
    expect(gen.nextMessageId()).toBe("m-1");
    expect(gen.nextToolCallId()).toBe("tc-1");
  });
  it("reserve then next skips reserved IDs", () => {
    const gen = createIdGenerator();
    gen.reserveMessageId("msg-5");
    expect(gen.nextMessageId()).toBe("msg-6");
  });
  it("reserve ignores wrong prefix", () => {
    const gen = createIdGenerator();
    gen.reserveMessageId("tool-99");
    expect(gen.nextMessageId()).toBe("msg-1");
  });
  it("reserve ignores non-numeric suffixes", () => {
    const gen = createIdGenerator();
    gen.reserveMessageId("msg-abc");
    expect(gen.nextMessageId()).toBe("msg-1");
  });
});
