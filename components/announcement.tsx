import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "@/lib/icons";

export const Announcement = () => (
  <Badge asChild className="bg-transparent" variant="secondary">
    <Link
      href="https://github.com/hanshapd/frakment"
      rel="noreferrer"
      target="_blank"
    >
      <span className="flex size-2 rounded-full bg-blue-500" title="New" />
      Frakment CLI is live <ArrowRightIcon />
    </Link>
  </Badge>
);
