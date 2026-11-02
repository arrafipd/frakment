"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SwitchDisabled() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="s-dis" disabled />
      <Label htmlFor="s-dis" className="opacity-50">Disabled</Label>
    </div>
  );
}
