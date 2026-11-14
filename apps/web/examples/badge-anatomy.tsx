import { CheckIcon, PackageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BadgeAnatomy() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Badge>Text only</Badge>
      <Badge>
        <CheckIcon />
        With icon
      </Badge>
      <Badge variant="outline">
        <PackageIcon />
        v1.2.0
      </Badge>
    </div>
  );
}
