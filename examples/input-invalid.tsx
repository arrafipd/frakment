"use client";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function InputInvalid() {
  return (
    <Field className="w-full max-w-xs" data-invalid>
      <FieldLabel htmlFor="input-invalid">Invalid Input</FieldLabel>
      <Input aria-invalid id="input-invalid" placeholder="Error" />
      <FieldDescription>
        This field contains validation errors.
      </FieldDescription>
    </Field>
  );
}
