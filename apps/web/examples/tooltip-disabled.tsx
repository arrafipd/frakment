import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TooltipDisabled() {
  return (
    <Tooltip>
      <TooltipTrigger as="span" className="inline-block w-fit">
        <Button disabled variant="outline">
          Disabled
        </Button>
      </TooltipTrigger>
      <TooltipContent>This feature is currently unavailable</TooltipContent>
    </Tooltip>
  );
}
