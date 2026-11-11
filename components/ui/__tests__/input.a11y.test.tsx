import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { axeOptions } from "@/lib/test/axe-options";
import { Input } from "../input";

describe("Input (a11y)", () => {
  it("exposes an accessible textbox role", () => {
    render(<Input aria-label="Email" />);
    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
  });

  it("has no axe violations (default)", async () => {
    const { container } = render(<Input aria-label="Email" />);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = render(<Input aria-label="Email" disabled />);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
