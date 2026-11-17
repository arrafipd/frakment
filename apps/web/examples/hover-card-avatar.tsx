"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export function HoverCardAvatar() {
  return (
    <div className="mx-auto flex items-center justify-center">
      <HoverCard closeDelay={100} openDelay={50}>
        <HoverCardTrigger as="button" className="rounded-full" type="button">
          <span className="bg-muted flex size-10 items-center justify-center rounded-full text-sm font-medium">
            AR
          </span>
        </HoverCardTrigger>
        <HoverCardContent className="w-72">
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Arya Rahman</span>
            <span className="text-muted-foreground text-sm">@johndoe</span>
            <p className="mt-2 text-sm">Building Frakment.</p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
