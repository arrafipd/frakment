"use client";

import { Slot } from "@/components/ui/slot";

export function SlotDemo() {
  return (
    <Slot className="bg-primary text-primary-foreground inline-flex h-9 items-center rounded-md px-4 text-sm font-medium">
      <a href="/docs">Open documentation</a>
    </Slot>
  );
}
