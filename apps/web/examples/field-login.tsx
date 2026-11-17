"use client";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function FieldLogin() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" />
          <FieldDescription>At least 8 characters.</FieldDescription>
        </Field>
      </FieldGroup>
    </div>
  );
}
