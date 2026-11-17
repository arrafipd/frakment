"use client";

import * as React from "react";

import { Slider } from "@/components/ui/slider";

export function SliderSettingsPanel() {
  const [volume, setVolume] = React.useState(75);
  const [brightness, setBrightness] = React.useState(60);

  return (
    <div className="border-border mx-auto w-full max-w-sm space-y-6 rounded-lg border p-4">
      <div className="grid gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Volume</span>
          <span className="text-muted-foreground tabular-nums">{volume}</span>
        </div>
        <Slider
          defaultValue={[75]}
          max={100}
          onValueChange={(value) => setVolume(value[0])}
          step={1}
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Brightness</span>
          <span className="text-muted-foreground tabular-nums">
            {brightness}
          </span>
        </div>
        <Slider
          defaultValue={[60]}
          max={100}
          onValueChange={(value) => setBrightness(value[0])}
          step={1}
        />
      </div>
    </div>
  );
}
