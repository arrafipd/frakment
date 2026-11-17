import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

export function SpinnerBadge() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>
        <Spinner data-icon="inline-start" />
        Syncing
      </Badge>
      <Badge variant="secondary">
        <Spinner data-icon="inline-start" />
        Updating
      </Badge>
      <Badge variant="outline">
        Processing
        <Spinner data-icon="inline-end" />
      </Badge>
    </div>
  );
}
