import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../accordion";

function Fixture({ animation }: { animation?: false | string }) {
  return (
    <Accordion animation={animation} collapsible defaultValue="a" type="single">
      <AccordionItem value="a">
        <AccordionTrigger>Question</AccordionTrigger>
        <AccordionContent>Answer</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe("Accordion animation prop", () => {
  it("renders without animation prop", () => {
    const { container } = render(<Fixture />);
    expect(
      container.querySelector('[data-slot="accordion-content"]')
    ).toBeTruthy();
  });

  it("renders with spring DSL", () => {
    const { container } = render(<Fixture animation="spring(300, 25)" />);
    expect(
      container.querySelector('[data-slot="accordion-content"]')
    ).toBeTruthy();
  });

  it("renders with false (disabled)", () => {
    const { container } = render(<Fixture animation={false} />);
    expect(
      container.querySelector('[data-slot="accordion-content"]')
    ).toBeTruthy();
  });

  it("warns on invalid DSL and still renders", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Fixture animation="wobbleOut" />);
    expect(
      container.querySelector('[data-slot="accordion-content"]')
    ).toBeTruthy();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
