import { CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TooltipIconHint() {
  return (
    <Tooltip>
      <TooltipTrigger aria-label="Copy" as={Button} size="icon" variant="ghost">
        <CopyIcon />
      </TooltipTrigger>
      <TooltipContent>Copy to clipboard</TooltipContent>
    </Tooltip>
  );
}
