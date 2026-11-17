"use client";

import { HoloCard, HoloCardImage } from "@/components/ui/holo-card";

export function HoloCardCosmosDemo() {
  return (
    <HoloCard className="max-w-xs" preset="cosmos" variant="image">
      <HoloCardImage
        alt="Holographic card"
        src="/examples/holo-card/holo-card-light-2.avif"
      />
    </HoloCard>
  );
}
