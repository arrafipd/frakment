import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { axeOptions } from "@/lib/test/axe-options";
import { Separator } from "../separator";

describe("Separator (a11y)", () => {
  it("exposes separator role when non-decorative", () => {
    render(<Separator decorative={false} />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("has no axe violations (horizontal, non-decorative)", async () => {
    const { container } = render(<Separator decorative={false} />);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations (vertical, non-decorative)", async () => {
    const { container } = render(
      <Separator decorative={false} orientation="vertical" />
    );
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
