import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { axeOptions } from "@/lib/test/axe-options";
import { Input } from "../input";
import { Label } from "../label";

describe("Label (a11y)", () => {
  it("renders text content", () => {
    render(<Label>Email</Label>);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("associates with an input via htmlFor", () => {
    render(
      <>
        <Label htmlFor="email-test">Email</Label>
        <Input id="email-test" />
      </>
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("has no axe violations (associated)", async () => {
    const { container } = render(
      <>
        <Label htmlFor="email-test">Email</Label>
        <Input id="email-test" />
      </>
    );
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
