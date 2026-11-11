import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { axeOptions } from "@/lib/test/axe-options";
import { Spinner } from "../spinner";

describe("Spinner (a11y)", () => {
  it("exposes a status role with accessible label", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("has no axe violations (default)", async () => {
    const { container } = render(<Spinner />);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations (spoke variant)", async () => {
    const { container } = render(<Spinner variant="spoke" />);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
