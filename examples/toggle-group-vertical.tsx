import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "@/lib/icons";

export function ToggleGroupVertical() {
  return (
    <ToggleGroup
      defaultValue={["bold", "italic"]}
      orientation="vertical"
      spacing={1}
      type="multiple"
    >
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
