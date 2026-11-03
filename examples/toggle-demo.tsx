import { Toggle } from "@/components/ui/toggle";
import { BookmarkIcon } from "@/lib/icons";

export function ToggleDemo() {
  return (
    <Toggle aria-label="Toggle bookmark" size="sm" variant="outline">
      <BookmarkIcon className="group-aria-pressed/toggle:fill-foreground" />
      Bookmark
    </Toggle>
  );
}
