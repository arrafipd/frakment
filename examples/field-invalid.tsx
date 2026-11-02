"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function FieldInvalid() {
  return (
    <Field data-invalid className="w-full max-w-xs">
      <FieldLabel htmlFor="invalid-input">Invalid Input</FieldLabel>
      <Input id="invalid-input" placeholder="Error" aria-invalid />
      <FieldDescription>
        This field contains validation errors.
      </FieldDescription>
    </Field>
  );
}
