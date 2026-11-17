"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TextareaBio() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="bio">Bio</Label>
      <Textarea id="bio" placeholder="A few words about you…" rows={4} />
      <p className="text-muted-foreground text-xs">Max 160 characters.</p>
    </div>
  );
}
