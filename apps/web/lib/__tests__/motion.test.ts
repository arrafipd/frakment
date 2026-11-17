import { act, render } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { getTransition, parseMotion, useMotionGuard } from "@/lib/motion";

describe("parseMotion", () => {
  it("returns null for undefined", () => {
    expect(parseMotion(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseMotion("")).toBeNull();
  });

  it("returns disabled for off", () => {
    expect(parseMotion("off")).toEqual({
      disabled: true,
      duration: 0,
      easing: "linear",
    });
  });

  it("parses bare duration", () => {
    expect(parseMotion("150")).toEqual({
      disabled: false,
      duration: 150,
      easing: "ease-in-out",
    });
  });

  it("parses seconds and milliseconds suffix", () => {
    expect(parseMotion("0.5s")?.duration).toBe(500);
    expect(parseMotion("300ms")?.duration).toBe(300);
  });

  it("parses CSS native easing", () => {
    expect(parseMotion("150 ease-out")?.easing).toBe("ease-out");
    expect(parseMotion("200 ease-in-out")?.easing).toBe("ease-in-out");
    expect(parseMotion("linear")?.easing).toBe("linear");
  });

  it("parses cubic-bezier", () => {
    expect(parseMotion("150 cubic-bezier(0.16, 1, 0.3, 1)")?.easing).toBe(
      "cubic-bezier(0.16, 1, 0.3, 1)"
    );
  });

  it("warns and returns null for spring", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(parseMotion("springSoft")).toBeNull();
    expect(parseMotion("spring(200,30)")).toBeNull();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("accepts any custom easing string", () => {
    expect(parseMotion("150 easeOut")?.easing).toBe("easeOut");
    expect(parseMotion("150 myCustomEase")?.easing).toBe("myCustomEase");
    expect(parseMotion("150 fast")?.easing).toBe("fast");
  });
});

describe("getTransition", () => {
  it("returns undefined for null", () => {
    expect(getTransition(null)).toBeUndefined();
  });

  it("returns none for disabled", () => {
    expect(
      getTransition({ disabled: true, duration: 0, easing: "linear" })
    ).toBe("none");
  });

  it("returns CSS string", () => {
    expect(
      getTransition({ disabled: false, duration: 150, easing: "ease-out" })
    ).toBe("all 150ms ease-out");
  });
});

interface TestComponentProps {
  elRef: React.RefObject<HTMLDivElement | null>;
  enabled: boolean;
}

function TestComponent({ enabled, elRef }: TestComponentProps) {
  const yielded = useMotionGuard(elRef, enabled);
  return React.createElement("div", {
    "data-testid": "guard-el",
    "data-yielded": yielded ? "1" : "0",
    ref: elRef,
  });
}

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe("useMotionGuard", () => {
  it("does not yield when nothing mutates", async () => {
    const elRef = React.createRef<HTMLDivElement>();
    const { container } = render(
      React.createElement(TestComponent, { elRef, enabled: true })
    );
    await flush();
    const el = container.firstElementChild as HTMLDivElement;
    expect(el.getAttribute("data-yielded")).toBe("0");
  });

  it("yields when style is mutated externally", async () => {
    const elRef = React.createRef<HTMLDivElement>();
    const { container } = render(
      React.createElement(TestComponent, { elRef, enabled: true })
    );
    await flush();
    const el = container.firstElementChild as HTMLDivElement;
    await act(async () => {
      el.style.transform = "scale(1.1)";
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(el.getAttribute("data-yielded")).toBe("1");
  });

  it("does not attach observer when disabled", async () => {
    const elRef = React.createRef<HTMLDivElement>();
    const { container } = render(
      React.createElement(TestComponent, { elRef, enabled: false })
    );
    await flush();
    const el = container.firstElementChild as HTMLDivElement;
    await act(async () => {
      el.style.transform = "scale(1.1)";
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(el.getAttribute("data-yielded")).toBe("0");
  });
});
