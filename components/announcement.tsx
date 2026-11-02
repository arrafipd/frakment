import { ArrowRightIcon } from "@/lib/icons";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";

export const Announcement = () => (
  <Badge asChild variant="secondary" className="bg-transparent">
    <Link
      href="https://github.com/hanshapd/frakment"
      target="_blank"
      rel="noreferrer"
    >
      <span className="flex size-2 rounded-full bg-blue-500" title="New" />
      Frakment CLI is live <ArrowRightIcon />
    </Link>
  </Badge>
);
