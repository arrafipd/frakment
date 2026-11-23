import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

let referenceRect: DOMRect;

async function expectInlinePosition() {
  await waitFor(() => {
    const wrapper = document.querySelector<HTMLElement>(
      "[data-popper-wrapper]"
    );
    expect(wrapper).not.toBeNull();
    expect(wrapper?.style.position).toBe("fixed");
    expect(wrapper?.style.transform).toBe("translate(100px, 234px)");
  });
}

describe("overlay positioning", () => {
  beforeEach(() => {
    referenceRect = new DOMRect(100, 200, 80, 30);
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      () => referenceRect
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  });

  it("positions Select content", async () => {
    render(
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue placeholder="Choose an option" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="one">One</SelectItem>
        </SelectContent>
      </Select>
    );

    await expectInlinePosition();
  });

  it("positions Popover content inline", async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    );

    await expectInlinePosition();
  });

  it("flips and shifts Popover content to stay within the viewport", async () => {
    referenceRect = new DOMRect(980, 750, 80, 30);

    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    );

    await waitFor(() => {
      const wrapper = document.querySelector<HTMLElement>(
        "[data-popper-wrapper]"
      );
      const content = document.querySelector<HTMLElement>(
        '[data-slot="popover-content"]'
      );
      expect(content?.dataset.side).toBe("top");
      expect(wrapper?.style.transform).toBe("translate(944px, 716px)");
    });
  });

  it("positions Dropdown Menu content inline", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent motion="off">Menu content</DropdownMenuContent>
      </DropdownMenu>
    );

    await expectInlinePosition();
  });
});
