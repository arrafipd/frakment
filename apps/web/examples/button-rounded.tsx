import { ArrowUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ButtonRounded() {
  return (
    <div className="flex gap-2">
      <Button className="rounded-full">Get Started</Button>
      <Button className="rounded-full" size="icon" variant="outline">
        <ArrowUpIcon />
      </Button>
    </div>
  );
}
