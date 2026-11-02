"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SwitchWithDescription() {
  return (
    <div className="flex items-start justify-between gap-4 w-full max-w-sm">
      <div className="flex flex-col gap-1">
        <Label htmlFor="s-sync">Share across devices</Label>
        <p className="text-sm text-muted-foreground">
          Focused settings sync between devices.
        </p>
      </div>
      <Switch id="s-sync" />
    </div>
  );
}
