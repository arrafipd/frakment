import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ToggleGroupSpacing() {
  return (
    <ToggleGroup
      defaultValue="top"
      size="sm"
      spacing={2}
      type="single"
      variant="outline"
    >
      <ToggleGroupItem aria-label="Toggle top" value="top">
        Top
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle bottom" value="bottom">
        Bottom
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle left" value="left">
        Left
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle right" value="right">
        Right
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
