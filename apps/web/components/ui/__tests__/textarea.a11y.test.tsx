import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { axeOptions } from "@/lib/test/axe-options";
import { Textarea } from "../textarea";

describe("Textarea (a11y)", () => {
  it("exposes an accessible textbox role", () => {
    render(<Textarea aria-label="Message" />);
    expect(
      screen.getByRole("textbox", { name: "Message" })
    ).toBeInTheDocument();
  });

  it("has no axe violations (default)", async () => {
    const { container } = render(<Textarea aria-label="Message" />);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = render(<Textarea aria-label="Message" disabled />);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
