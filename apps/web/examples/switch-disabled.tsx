"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SwitchDisabled() {
  return (
    <div className="flex items-center gap-2">
      <Switch disabled id="s-dis" />
      <Label className="opacity-50" htmlFor="s-dis">
        Disabled
      </Label>
    </div>
  );
}
