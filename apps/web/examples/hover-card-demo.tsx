import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export function HoverCardDemo() {
  return (
    <HoverCard closeDelay={100} openDelay={10}>
      <HoverCardTrigger as={Button} variant="link">
        Hover Here
      </HoverCardTrigger>
      <HoverCardContent className="flex w-64 flex-col gap-0.5">
        <div className="font-semibold">@nextjs</div>
        <div>The React Framework – created and maintained by @vercel.</div>
        <div className="text-muted-foreground mt-1 text-xs">
          Joined December 2021
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
