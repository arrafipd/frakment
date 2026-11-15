"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function RadioGroupPlan() {
  return (
    <RadioGroup className="mx-auto w-full max-w-sm" defaultValue="pro">
      <div className="flex items-center gap-2">
        <RadioGroupItem id="free" value="free" />
        <Label htmlFor="free">Free</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="pro" value="pro" />
        <Label htmlFor="pro">Pro</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="team" value="team" />
        <Label htmlFor="team">Team</Label>
      </div>
    </RadioGroup>
  );
}
