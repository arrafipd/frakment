"use client";

import * as React from "react";

import { Slider } from "@/components/ui/slider";

export function SliderPriceFilter() {
  const [range, setRange] = React.useState([25, 75]);

  return (
    <div className="border-border mx-auto w-full max-w-sm rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium">Price range</span>
        <span className="text-muted-foreground tabular-nums">
          ${range[0]} – ${range[1]}
        </span>
      </div>
      <Slider
        defaultValue={[25, 75]}
        max={100}
        onValueChange={setRange}
        step={5}
      />
    </div>
  );
}
