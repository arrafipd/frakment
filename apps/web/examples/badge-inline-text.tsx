import { CircleAlertIcon, SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BadgeInlineText() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        Frakment
        <Badge>
          <SparklesIcon />
          v1.0
        </Badge>
      </h2>
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        Status
        <Badge variant="outline">
          <CircleAlertIcon />
          Beta
        </Badge>
      </div>
    </div>
  );
}
