import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

export function ToggleGroupOutline() {
  return (
    <ToggleGroup type="single" variant="outline" defaultValue="all">
      <ToggleGroupItem value="all" aria-label="Toggle all">
        All
      </ToggleGroupItem>
      <ToggleGroupItem value="missed" aria-label="Toggle missed">
        Missed
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
