import { ItalicIcon } from "@/lib/icons";

import { Toggle } from "@/components/ui/toggle";

export function ToggleText() {
  return (
    <Toggle aria-label="Toggle italic">
      <ItalicIcon />
      Italic
    </Toggle>
  );
}