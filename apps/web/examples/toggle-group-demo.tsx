import { BoldIcon as Bold, Italic, Underline } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ToggleGroupDemo() {
  return (
    <ToggleGroup type="multiple" variant="outline">
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
