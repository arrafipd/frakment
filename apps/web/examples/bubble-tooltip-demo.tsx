import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@/components/ui/message";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function BubbleTooltipDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 py-6">
      <Bubble variant="secondary">
        <BubbleContent>Did you remove the stale route?</BubbleContent>
      </Bubble>
      <Bubble align="end">
        <BubbleContent>Yes, removed it from the registry.</BubbleContent>
        <BubbleReactions className="p-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Read on Jan 5, 2026 at 4:32 PM"
                className="rounded-full"
                size="icon-xs"
                variant="ghost"
              >
                <CheckIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Read on Jan 5, 2026 at 4:32 PM</TooltipContent>
          </Tooltip>
        </BubbleReactions>
      </Bubble>
    </div>
  );
}
