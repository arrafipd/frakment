import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../accordion";

function Fixture({ motion }: { motion?: string | false }) {
  return (
    <Accordion
      collapsible
      defaultValue="a"
      motion={motion === false ? undefined : motion}
      type="single"
    >
      <AccordionItem value="a">
        <AccordionTrigger>Question</AccordionTrigger>
        <AccordionContent>Answer</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe("Accordion motion prop", () => {
  it("renders without motion prop", () => {
    const { container } = render(<Fixture />);
    expect(
      container.querySelector('[data-slot="accordion-content"]')
    ).toBeTruthy();
  });

  it("renders with motion string", () => {
    const { container } = render(<Fixture motion="150 ease-out" />);
    expect(
      container.querySelector('[data-slot="accordion-content"]')
    ).toBeTruthy();
  });

  it("renders with motion off (transition none)", () => {
    const { container } = render(<Fixture motion="off" />);
    const el = container.querySelector(
      '[data-slot="accordion-content"] > div'
    ) as HTMLElement | null;
    expect(el).toBeTruthy();
    expect(el?.style.transition).toBe("none");
  });

  it("warns on invalid motion and still renders", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Fixture motion="spring(300, 25)" />);
    expect(
      container.querySelector('[data-slot="accordion-content"]')
    ).toBeTruthy();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
