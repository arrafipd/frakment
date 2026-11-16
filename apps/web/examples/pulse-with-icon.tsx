import { CircleCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import Pulse from "@/components/ui/pulse";

export function PulseWithIcon() {
  return (
    <div className="flex w-full flex-col items-start gap-4">
      <Badge>
        <span aria-hidden className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <CircleCheckIcon aria-hidden />
        All systems operational
      </Badge>
      <Pulse
        days={14}
        services={[
          { incidents: {}, name: "API" },
          { incidents: {}, name: "Database" },
        ]}
        title="Service status"
      />
    </div>
  );
}
