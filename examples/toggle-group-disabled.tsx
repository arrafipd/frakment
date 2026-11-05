import { BoldIcon as Bold, Italic, Underline } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ToggleGroupDisabled() {
  return (
    <ToggleGroup disabled type="single">
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle strikethrough" value="strikethrough">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
