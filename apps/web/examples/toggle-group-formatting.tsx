"use client";

import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ToggleGroupFormatting() {
  return (
    <ToggleGroup type="multiple">
      <ToggleGroupItem aria-label="Bold" value="bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Italic" value="italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Underline" value="underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
