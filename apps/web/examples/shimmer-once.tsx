"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

export function ShimmerOnce() {
  const [key, setKey] = React.useState(0);

  return (
    <div className="flex flex-col items-center gap-4">
      <p
        className="shimmer text-muted-foreground shimmer-once text-sm"
        key={key}
      >
        Generating response&hellip;
      </p>
      <Button
        onClick={() => setKey((value) => value + 1)}
        size="sm"
        variant="outline"
      >
        Replay
      </Button>
    </div>
  );
}
