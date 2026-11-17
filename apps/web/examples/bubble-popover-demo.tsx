import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@/components/ui/message";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

export function BubblePopoverDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 py-6">
      <Bubble align="end">
        <BubbleContent>Run the build script.</BubbleContent>
      </Bubble>
      <Bubble variant="destructive">
        <BubbleContent>Failed to run the command.</BubbleContent>
        <BubbleReactions>
          <Popover>
            <PopoverTrigger
              aria-label="Show error details"
              as={Button}
              className="aria-expanded:text-destructive rounded-full"
              size="icon-xs"
              variant="ghost"
            >
              <InfoIcon />
            </PopoverTrigger>
            <PopoverContent>
              <PopoverHeader>
                <PopoverTitle className="text-sm">
                  Command failed with exit code 1
                </PopoverTitle>
                <PopoverDescription className="text-sm">
                  ENOENT: no such file or directory, open pnpm-lock.yaml
                </PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        </BubbleReactions>
      </Bubble>
    </div>
  );
}
