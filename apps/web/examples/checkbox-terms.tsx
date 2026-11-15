"use client";

import { Checkbox } from "@/components/ui/checkbox";

export function CheckboxTerms() {
  return (
    <div className="mx-auto flex max-w-sm items-center gap-2">
      <Checkbox id="terms" />
      <label className="text-sm leading-4" htmlFor="terms">
        I agree to the Terms of Service and Privacy Policy.
      </label>
    </div>
  );
}
