"use client";

import { Textarea } from "@/components/ui/textarea";

export function TextareaAutogrow() {
  return (
    <div className="w-full max-w-sm">
      <Textarea
        placeholder="Type a long message - the textarea grows as you type."
        defaultValue="field-sizing-content makes this grow automatically without JavaScript."
      />
    </div>
  );
}