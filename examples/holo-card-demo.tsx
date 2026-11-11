"use client";

import { FrakmentMark } from "@/components/brand";
import { HoloCard } from "@/components/ui/holo-card";

export function HoloCardDemo() {
  return (
    <HoloCard className="max-w-xs" logo={<FrakmentMark />} preset="bursts" />
  );
}
