"use client";

import { HoloCard, HoloCardImage } from "@/components/ui/holo-card";

export function HoloCardBurstsDemo() {
  return (
    <HoloCard className="max-w-xs" preset="bursts" variant="image">
      <HoloCardImage
        alt="Holographic card"
        src="/examples/holo-card/holo-card-dark-2.avif"
      />
    </HoloCard>
  );
}
