import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { axeOptions } from "@/tests/utils/axe-options";
import { Switch } from "../switch";

describe("Switch (a11y)", () => {
  it("exposes a switch role with accessible name", () => {
    render(<Switch aria-label="Enable notifications" />);
    expect(
      screen.getByRole("switch", { name: "Enable notifications" })
    ).toBeInTheDocument();
  });

  it("has no axe violations (default)", async () => {
    const { container } = render(<Switch aria-label="Enable" />);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = render(<Switch aria-label="Enable" disabled />);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });

  it("yields the thumb transition when an external animation writes inline styles", async () => {
    const { container } = render(
      <Switch aria-label="Enable" motion="300 ease-out" />
    );
    const thumb = container.querySelector<HTMLElement>(
      '[data-slot="switch-thumb"]'
    );

    expect(thumb?.style.transition).toBe("300ms ease-out");

    if (!thumb) {
      throw new Error("Switch thumb was not rendered");
    }

    thumb.style.transform = "translateX(1px)";

    await waitFor(() => {
      expect(thumb.style.transition).toBe("none");
    });
  });
});
