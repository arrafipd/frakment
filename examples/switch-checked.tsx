"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SwitchChecked() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="s-wifi" defaultChecked />
      <Label htmlFor="s-wifi">Wi-Fi</Label>
    </div>
  );
}
