"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function PopoverAlignments() {
  return (
    <div className="flex gap-6">
      <Popover>
        <PopoverTrigger as={Button} size="sm" variant="outline">
          Start
        </PopoverTrigger>
        <PopoverContent align="start" className="w-40">
          Aligned to start
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger as={Button} size="sm" variant="outline">
          Center
        </PopoverTrigger>
        <PopoverContent align="center" className="w-40">
          Aligned to center
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger as={Button} size="sm" variant="outline">
          End
        </PopoverTrigger>
        <PopoverContent align="end" className="w-40">
          Aligned to end
        </PopoverContent>
      </Popover>
    </div>
  );
}
