"use client";

import { BoldIcon } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

export function ToggleToolbar() {
  return (
    <Toggle aria-label="Bold" variant="outline">
      <BoldIcon />
    </Toggle>
  );
}
