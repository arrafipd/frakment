"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SwitchWithDescription() {
  return (
    <div className="flex w-full max-w-sm items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="s-sync">Share across devices</Label>
        <p className="text-muted-foreground text-sm">
          Focused settings sync between devices.
        </p>
      </div>
      <Switch id="s-sync" />
    </div>
  );
}
