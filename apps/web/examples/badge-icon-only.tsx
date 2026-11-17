import { CheckIcon, ClockIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BadgeIconOnly() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Badge aria-label="Verified" iconOnly>
        <CheckIcon />
      </Badge>
      <Badge aria-label="Pending" iconOnly variant="secondary">
        <ClockIcon />
      </Badge>
      <Badge aria-label="Failed" iconOnly variant="destructive">
        <XIcon />
      </Badge>
    </div>
  );
}
