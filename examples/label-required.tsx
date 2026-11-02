"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LabelRequired() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="req">
        Email <span className="text-destructive">*</span>
      </Label>
      <Input id="req" type="email" placeholder="required" required />
    </div>
  );
}
