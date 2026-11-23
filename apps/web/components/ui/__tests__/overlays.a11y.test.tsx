import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../hover-card";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../select";
import { Sheet, SheetContent } from "../sheet";

function enableReducedMotion() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((media: string) => ({
      addEventListener: vi.fn(),
      matches: media === "(prefers-reduced-motion: reduce)",
      media,
      removeEventListener: vi.fn(),
    })),
  });
}

describe("overlay accessibility", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(window, "matchMedia");
  });

  it("allows Tab to leave an open dropdown menu", () => {
    const onOpenChange = vi.fn();
    render(
      <DropdownMenu onOpenChange={onOpenChange} open>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent motion="off">
          <DropdownMenuItem>First item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "Tab" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("allows Tab to leave an open select listbox", () => {
    const onOpenChange = vi.fn();
    render(
      <Select onOpenChange={onOpenChange} open>
        <SelectTrigger aria-label="Choose a value" />
        <SelectContent>
          <SelectItem value="first">First option</SelectItem>
        </SelectContent>
      </Select>
    );

    const listbox = screen.getByRole("listbox");
    fireEvent.keyDown(listbox, { key: "Tab" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("associates the hover card with its trigger and disables motion when requested", async () => {
    enableReducedMotion();
    vi.stubGlobal("ResizeObserver", function MockResizeObserver() {
      return {
        disconnect: vi.fn(),
        observe: vi.fn(),
      };
    });

    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger aria-describedby="existing-description">
          Details
        </HoverCardTrigger>
        <HoverCardContent>More details</HoverCardContent>
      </HoverCard>
    );

    await waitFor(() => {
      const trigger = screen.getByRole("button", { name: "Details" });
      const content = screen.getByRole("tooltip");
      expect(trigger.getAttribute("aria-describedby")?.split(" ")).toEqual(
        expect.arrayContaining(["existing-description", content.id])
      );
      expect(content).toHaveStyle({ transition: "none" });
    });
  });

  it("disables sheet motion when reduced motion is requested", async () => {
    enableReducedMotion();
    render(
      <Sheet open>
        <SheetContent aria-label="Settings">Settings panel</SheetContent>
      </Sheet>
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Settings" })).toHaveStyle({
        transition: "none",
      });
    });
  });
});
