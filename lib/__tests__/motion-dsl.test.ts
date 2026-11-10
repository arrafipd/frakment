import { describe, expect, it, vi } from "vitest";
import { parseAnimation } from "../motion-dsl";

describe("parseAnimation", () => {
  it("returns null for undefined", () => {
    expect(parseAnimation(undefined)).toBeNull();
  });

  it("returns null for false", () => {
    expect(parseAnimation(false)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseAnimation("")).toBeNull();
    expect(parseAnimation("   ")).toBeNull();
  });

  it("parses spring", () => {
    expect(parseAnimation("spring(300, 25)")).toEqual({
      transition: { damping: 25, stiffness: 300, type: "spring" },
    });
  });

  it("parses inertia", () => {
    expect(parseAnimation("inertia(0.2, 400)")).toEqual({
      transition: { power: 0.2, timeConstant: 400, type: "inertia" },
    });
  });

  it("parses named easing without duration", () => {
    const r = parseAnimation("easeInOut");
    expect(r).not.toBeNull();
    expect(r?.transition).toMatchObject({ type: "tween" });
  });

  it("parses named easing with ms duration", () => {
    const r = parseAnimation("easeInOut 300ms");
    expect(r?.transition).toMatchObject({ duration: 0.3, type: "tween" });
  });

  it("parses named easing with seconds duration", () => {
    const r = parseAnimation("easeOutExpo 0.5");
    expect(r?.transition).toMatchObject({ duration: 0.5, type: "tween" });
  });

  it("parses cubic-bezier", () => {
    const r = parseAnimation("cubic-bezier(0.4, 0, 0.2, 1) 300ms");
    expect(r?.transition).toMatchObject({
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      type: "tween",
    });
  });

  it("parses delay and repeat options", () => {
    const r = parseAnimation("easeInOut 300ms delay(100ms) repeat(3)");
    expect(r?.transition).toMatchObject({
      delay: 0.1,
      duration: 0.3,
      repeat: 3,
      type: "tween",
    });
  });

  it("parses repeat(infinite)", () => {
    const r = parseAnimation("easeInOut 300ms repeat(infinite)");
    expect(r?.transition.repeat).toBe(Number.POSITIVE_INFINITY);
  });

  it("parses keyframes with values only", () => {
    const r = parseAnimation("keyframes([0, 1.2, 1]) 500ms");
    expect(r?.keyframes).toEqual({ values: [0, 1.2, 1] });
    expect(r?.transition).toMatchObject({ duration: 0.5, type: "tween" });
  });

  it("parses keyframes with times", () => {
    const r = parseAnimation("keyframes([0, 1.2, 1], [0, 0.5, 1]) 500ms");
    expect(r?.keyframes).toEqual({
      times: [0, 0.5, 1],
      values: [0, 1.2, 1],
    });
  });

  it("warns on invalid spring args", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(parseAnimation("spring(abc, def)")).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("warns on unknown easing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(parseAnimation("wobbleOut 300ms")).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("warns on invalid cubic-bezier", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(parseAnimation("cubic-bezier(0.4, 0) 300ms")).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
