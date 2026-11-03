"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LabelDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" placeholder="name@example.com" type="email" />
    </div>
  );
}
