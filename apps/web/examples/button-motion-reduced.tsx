import { CircleDotDashedIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ButtonMotionReduced() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button motion="off" variant="outline">
        Forced off
      </Button>
      <Button aria-label="Submit" size="icon" variant="outline">
        <CircleDotDashedIcon />
      </Button>
    </div>
  );
}
