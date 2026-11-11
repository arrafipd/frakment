import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMergedRef } from "../use-merged-ref";

describe("useMergedRef", () => {
  it("calls function ref with node and null", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useMergedRef(fn));
    const node = document.createElement("div");
    result.current(node);
    expect(fn).toHaveBeenCalledWith(node);
    result.current(null);
    expect(fn).toHaveBeenLastCalledWith(null);
  });
  it("sets .current on object ref", () => {
    const o = { current: null as HTMLDivElement | null };
    const { result } = renderHook(() => useMergedRef(o));
    const node = document.createElement("div");
    result.current(node);
    expect(o.current).toBe(node);
  });
  it("handles mixed refs and undefined", () => {
    const fn = vi.fn();
    const o = { current: null as HTMLDivElement | null };
    const { result } = renderHook(() => useMergedRef(fn, undefined, o));
    const node = document.createElement("div");
    result.current(node);
    expect(fn).toHaveBeenCalledWith(node);
    expect(o.current).toBe(node);
  });
});
