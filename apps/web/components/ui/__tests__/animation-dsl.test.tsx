import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../collapsible";
import { CreditCardNumber } from "../credit-card";
import { TextMorph } from "../text-morph";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
} from "../trace";

describe("Collapsible animation prop", () => {
  it("renders default", () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>t</CollapsibleTrigger>
        <CollapsibleContent>c</CollapsibleContent>
      </Collapsible>
    );
    expect(
      container.querySelector('[data-slot="collapsible-content"]')
    ).toBeTruthy();
  });
  it("accepts spring DSL", () => {
    const { container } = render(
      <Collapsible animation="spring(300, 25)">
        <CollapsibleTrigger>t</CollapsibleTrigger>
        <CollapsibleContent>c</CollapsibleContent>
      </Collapsible>
    );
    expect(
      container.querySelector('[data-slot="collapsible-content"]')
    ).toBeTruthy();
  });
  it("accepts false", () => {
    const { container } = render(
      <Collapsible animation={false}>
        <CollapsibleTrigger>t</CollapsibleTrigger>
        <CollapsibleContent>c</CollapsibleContent>
      </Collapsible>
    );
    expect(
      container.querySelector('[data-slot="collapsible-content"]')
    ).toBeTruthy();
  });
});

describe("Trace animation prop", () => {
  it("renders default", () => {
    const { container } = render(
      <Trace>
        <TraceCollapsible defaultOpen>
          <TraceCollapsibleTrigger>t</TraceCollapsibleTrigger>
          <TraceCollapsibleContent>c</TraceCollapsibleContent>
        </TraceCollapsible>
      </Trace>
    );
    expect(
      container.querySelector('[data-slot="trace-collapsible-content"]')
    ).toBeTruthy();
  });
  it("accepts spring DSL", () => {
    const { container } = render(
      <Trace>
        <TraceCollapsible animation="spring(300, 25)" defaultOpen>
          <TraceCollapsibleTrigger>t</TraceCollapsibleTrigger>
          <TraceCollapsibleContent>c</TraceCollapsibleContent>
        </TraceCollapsible>
      </Trace>
    );
    expect(
      container.querySelector('[data-slot="trace-collapsible-content"]')
    ).toBeTruthy();
  });
  it("accepts false", () => {
    const { container } = render(
      <Trace>
        <TraceCollapsible animation={false} defaultOpen>
          <TraceCollapsibleTrigger>t</TraceCollapsibleTrigger>
          <TraceCollapsibleContent>c</TraceCollapsibleContent>
        </TraceCollapsible>
      </Trace>
    );
    expect(
      container.querySelector('[data-slot="trace-collapsible-content"]')
    ).toBeTruthy();
  });
});

describe("CreditCardNumber animation prop", () => {
  it("renders default", () => {
    const { container } = render(<CreditCardNumber value="4242424242424242" />);
    expect(container.querySelector("[aria-label]")).toBeTruthy();
  });
  it("accepts spring DSL", () => {
    const { container } = render(
      <CreditCardNumber animation="spring(300, 25)" value="4242424242424242" />
    );
    expect(container.querySelector("[aria-label]")).toBeTruthy();
  });
  it("accepts false (plain <p>)", () => {
    const { container } = render(
      <CreditCardNumber animation={false} value="4242424242424242" />
    );
    expect(container.querySelector("p")).toBeTruthy();
    expect(container.querySelector("motion.span, [style*=blur]")).toBeFalsy();
  });
});

describe("TextMorph animation prop", () => {
  it("renders default", () => {
    const { container } = render(
      <TextMorph>
        <span>a</span>
        <span>b</span>
      </TextMorph>
    );
    expect(container.firstChild).toBeTruthy();
  });
  it("accepts spring DSL", () => {
    const { container } = render(
      <TextMorph animation="spring(300, 25)">
        <span>a</span>
        <span>b</span>
      </TextMorph>
    );
    expect(container.firstChild).toBeTruthy();
  });
  it("accepts false", () => {
    const { container } = render(
      <TextMorph animation={false}>
        <span>a</span>
        <span>b</span>
      </TextMorph>
    );
    expect(container.firstChild).toBeTruthy();
  });
});
