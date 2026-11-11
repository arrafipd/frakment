"use client";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function FieldInvalid() {
  return (
    <Field className="max-w-xs" data-invalid>
      <FieldLabel htmlFor="invalid-input">Invalid Input</FieldLabel>
      <Input aria-invalid id="invalid-input" placeholder="Error" />
      <FieldDescription>
        This field contains validation errors.
      </FieldDescription>
    </Field>
  );
}
