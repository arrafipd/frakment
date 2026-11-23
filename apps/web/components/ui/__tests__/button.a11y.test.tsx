import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Button } from "../button";

const axeOptions = {
  rules: {
    "color-contrast": { enabled: false },
  },
} as const;

describe("Button (a11y)", () => {
  it("renders with accessible text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" })
    ).toBeInTheDocument();
  });

  it("has no axe violations (default)", async () => {
    const { container } = render(<Button>Submit</Button>);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });

  it("renders as an anchor when href is provided", () => {
    render(<Button href="/docs">Read the docs</Button>);
    const link = screen.getByRole("link", { name: "Read the docs" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/docs");
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
