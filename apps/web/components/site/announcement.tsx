import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "@/lib/icons";

export const Announcement = () => (
  <Badge
    as={Link}
    className="bg-transparent"
    href="https://github.com/frakment/ui"
    rel="noreferrer"
    target="_blank"
    variant="secondary"
  >
    <span className="flex size-2 rounded-full bg-blue-500" title="New" />
    Frakment CLI is live <ArrowRightIcon />
  </Badge>
);
