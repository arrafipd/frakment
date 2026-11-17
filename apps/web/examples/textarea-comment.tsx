"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TextareaComment() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="comment">Comment</Label>
      <Textarea id="comment" placeholder="Write a reply…" rows={3} />
    </div>
  );
}
