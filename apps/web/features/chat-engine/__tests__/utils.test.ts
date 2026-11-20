import { describe, expect, it, vi } from "vitest";
import {
  abortableSleep,
  assertNever,
  deepClone,
  devWarn,
  splitWords,
  stripDataPrefix,
} from "../utils";

describe("assertNever", () => {
  it("throws with serialized value", () => {
    expect(() => assertNever("x" as never)).toThrow('Unhandled variant: "x"');
  });
});
describe("abortableSleep", () => {
  it("resolves after delay", async () => {
    await expect(abortableSleep(10)).resolves.toBeUndefined();
  });
  it("resolves immediately if already aborted", async () => {
    const c = new AbortController();
    c.abort();
    const start = Date.now();
    await abortableSleep(1000, c.signal);
    expect(Date.now() - start).toBeLessThan(500);
  });
  it("resolves early when aborted mid-sleep", async () => {
    const c = new AbortController();
    const p = abortableSleep(1000, c.signal);
    setTimeout(() => c.abort(), 10);
    const start = Date.now();
    await p;
    expect(Date.now() - start).toBeLessThan(500);
  });
});
describe("deepClone", () => {
  it("clones without sharing references", () => {
    const obj = { a: 1, b: { c: 2 } };
    const clone = deepClone(obj);
    expect(clone).toEqual(obj);
    expect(clone.b).not.toBe(obj.b);
  });
});
describe("splitWords", () => {
  it("preserves trailing whitespace per word", () => {
    expect(splitWords("hello world ")).toEqual(["hello ", "world "]);
  });
  it("handles single word", () => {
    expect(splitWords("hello")).toEqual(["hello"]);
  });
});
describe("stripDataPrefix", () => {
  it("removes data- prefix", () => {
    expect(stripDataPrefix("data-user")).toBe("user");
  });
});
describe("devWarn", () => {
  it("warns in non-production", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    devWarn("test");
    expect(spy).toHaveBeenCalledWith("[helpers] test");
    spy.mockRestore();
  });
});
