// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/site/context-menu";

describe("ContextMenu", () => {
  it("opens on the context-menu gesture and closes after an action", () => {
    const handleAction = vi.fn();

    render(
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button type="button">Brand</button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleAction}>Copy icon</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );

    fireEvent.contextMenu(screen.getByRole("button", { name: "Brand" }), {
      clientX: 40,
      clientY: 50,
    });

    fireEvent.click(screen.getByRole("menuitem", { name: "Copy icon" }));

    expect(handleAction).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
