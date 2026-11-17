"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function SliderControlled() {
  const [value, setValue] = React.useState([0.3, 0.7]);

  return (
    <div className="mx-auto grid w-full max-w-xs gap-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="slider-demo-temperature">Temperature</Label>
        <span className="text-muted-foreground text-sm">
          {value.join(", ")}
        </span>
      </div>
      <Slider
        id="slider-demo-temperature"
        max={1}
        min={0}
        onValueChange={(value) => setValue(value as number[])}
        step={0.1}
        value={value}
      />
    </div>
  );
}
