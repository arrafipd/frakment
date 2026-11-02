"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

export function InputGroupBlockStart() {
  return (
    <div className="w-full max-w-sm">
      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText>Subject</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="Enter a subject" />
      </InputGroup>
    </div>
  );
}
