import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const hoverCardSides = ["left", "top", "bottom", "right"] as const;

export function HoverCardSides() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {hoverCardSides.map((side) => (
        <HoverCard closeDelay={100} key={side} openDelay={100}>
          <HoverCardTrigger
            as={Button}
            className="capitalize"
            variant="outline"
          >
            {side}
          </HoverCardTrigger>
          <HoverCardContent side={side}>
            <div className="flex flex-col gap-1">
              <h4 className="font-medium">Hover Card</h4>
              <p>This hover card appears on the {side} side of the trigger.</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
}
