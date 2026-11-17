"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LabelWithInput() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="name">Name</Label>
      <Input id="name" placeholder="Your name" />
    </div>
  );
}
