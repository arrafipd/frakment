import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { axeOptions } from "@/lib/test/axe-options";
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
});
