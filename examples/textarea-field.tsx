"use client";

import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";

export function TextareaField() {
  return (
    <div className="w-full max-w-sm">
      <Field>
        <FieldLabel htmlFor="feedback">Feedback</FieldLabel>
        <Textarea id="feedback" placeholder="Share your thoughts..." rows={4} />
        <FieldDescription>We read every message.</FieldDescription>
      </Field>
    </div>
  );
}