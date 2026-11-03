import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ToggleGroupOutline() {
  return (
    <ToggleGroup defaultValue="all" type="single" variant="outline">
      <ToggleGroupItem aria-label="Toggle all" value="all">
        All
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle missed" value="missed">
        Missed
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
