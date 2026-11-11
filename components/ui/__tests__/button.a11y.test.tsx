import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Button } from "../button";

/**
 * color-contrast DIMATIKAN permanen:
 *  - Design token warna Frakment dikelola manual oleh maintainer.
 *  - Test TIDAK BOLEH mengubah atau menyesuaikan warna token.
 *  - Test ini fokus: ARIA, label, semantic HTML, landmark.
 */
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

  it("has no axe violations (disabled)", async () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
