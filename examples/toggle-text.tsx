import { Toggle } from "@/components/ui/toggle";
import { ItalicIcon } from "@/lib/icons";

export function ToggleText() {
  return (
    <Toggle aria-label="Toggle italic">
      <ItalicIcon />
      Italic
    </Toggle>
  );
}
