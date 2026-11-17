import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TooltipAnatomy() {
  return (
    <Tooltip>
      <TooltipTrigger as={Button} variant="outline">
        Hover me
      </TooltipTrigger>
      <TooltipContent>Tooltip content</TooltipContent>
    </Tooltip>
  );
}
