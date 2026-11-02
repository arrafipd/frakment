"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function CheckboxDisabled() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="c-dis" disabled />
      <Label htmlFor="c-dis">Disabled</Label>
    </div>
  );
}
