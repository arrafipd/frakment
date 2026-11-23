import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../collapsible";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
} from "../trace";

describe("Collapsible motion prop", () => {
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
      <Collapsible motion="spring(300, 25)">
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
      <Collapsible motion="off">
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
