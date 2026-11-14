import { StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BadgeCounts() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Badge variant="secondary">12 issues</Badge>
      <Badge variant="secondary">
        <StarIcon />
        2.4k
      </Badge>
      <Badge variant="outline">+8</Badge>
    </div>
  );
}
