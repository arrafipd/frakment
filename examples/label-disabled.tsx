"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LabelDisabled() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="dis" className="opacity-50">Disabled field</Label>
      <Input id="dis" disabled defaultValue="Cannot edit" />
    </div>
  );
}
