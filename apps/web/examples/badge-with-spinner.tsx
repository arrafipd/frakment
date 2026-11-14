import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

export function BadgeWithSpinner() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="destructive">
        <Spinner borderWidth={1} />
        Deleting
      </Badge>
      <Badge variant="secondary">
        Generating
        <Spinner borderWidth={1} />
      </Badge>
    </div>
  );
}
