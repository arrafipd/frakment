import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { axeOptions } from "@/lib/test/axe-options";
import { Badge } from "../badge";

describe("Badge (a11y)", () => {
  it("renders visible text content", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("has no axe violations (default variant)", async () => {
    const { container } = render(<Badge>Default</Badge>);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations (destructive variant)", async () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
