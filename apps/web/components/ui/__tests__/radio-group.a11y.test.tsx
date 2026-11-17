import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { axeOptions } from "@/lib/test/axe-options";
import { RadioGroup, RadioGroupItem } from "../radio-group";

describe("RadioGroup (a11y)", () => {
  it("exposes a radiogroup role with radiogroup items", () => {
    render(
      <RadioGroup aria-label="Choose plan">
        <RadioGroupItem aria-label="Plan A" value="a" />
        <RadioGroupItem aria-label="Plan B" value="b" />
      </RadioGroup>
    );
    expect(
      screen.getByRole("radiogroup", { name: "Choose plan" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("has no axe violations (empty selection)", async () => {
    const { container } = render(
      <RadioGroup aria-label="Choose plan">
        <RadioGroupItem aria-label="Plan A" value="a" />
        <RadioGroupItem aria-label="Plan B" value="b" />
      </RadioGroup>
    );
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations (with selection)", async () => {
    const { container } = render(
      <RadioGroup aria-label="Choose plan" defaultValue="a">
        <RadioGroupItem aria-label="Plan A" value="a" />
        <RadioGroupItem aria-label="Plan B" value="b" />
      </RadioGroup>
    );
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
