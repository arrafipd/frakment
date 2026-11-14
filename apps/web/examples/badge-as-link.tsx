import { ArrowUpRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function BadgeAsLink() {
  return (
    <Badge as="a" href="#link">
      Open Link <ArrowUpRightIcon />
    </Badge>
  );
}
