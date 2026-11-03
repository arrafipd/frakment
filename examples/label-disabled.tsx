"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LabelDisabled() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label className="opacity-50" htmlFor="dis">
        Disabled field
      </Label>
      <Input defaultValue="Cannot edit" disabled id="dis" />
    </div>
  );
}
