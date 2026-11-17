import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { axeOptions } from "@/lib/test/axe-options";
import { Progress } from "../progress";

describe("Progress (a11y)", () => {
  it("exposes progressbar role with accessible name", () => {
    render(<Progress aria-label="Upload progress" value={50} />);
    expect(
      screen.getByRole("progressbar", { name: "Upload progress" })
    ).toBeInTheDocument();
  });

  it("has no axe violations (with value)", async () => {
    const { container } = render(
      <Progress aria-label="Upload progress" value={50} />
    );
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations (zero)", async () => {
    const { container } = render(
      <Progress aria-label="Upload progress" value={0} />
    );
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
