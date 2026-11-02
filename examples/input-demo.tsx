"use client";

import { Input } from "@/components/ui/input";

export function InputDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="Invalid" aria-invalid />
    </div>
  );
}
