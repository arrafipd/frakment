import { ArrowUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ButtonMotionDefault() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button variant="outline">Button</Button>
      <Button aria-label="Submit" size="icon" variant="outline">
        <ArrowUpIcon />
      </Button>
    </div>
  );
}
