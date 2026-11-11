import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { axeOptions } from "@/lib/test/axe-options";
import { Checkbox } from "../checkbox";

describe("Checkbox (a11y)", () => {
  it("exposes a checkbox role with accessible name", () => {
    render(<Checkbox aria-label="Accept terms" />);
    expect(
      screen.getByRole("checkbox", { name: "Accept terms" })
    ).toBeInTheDocument();
  });

  it("has no axe violations (unchecked)", async () => {
    const { container } = render(<Checkbox aria-label="Accept terms" />);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = render(
      <Checkbox aria-label="Accept terms" disabled />
    );
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
