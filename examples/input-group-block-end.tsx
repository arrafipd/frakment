"use client";

import { ArrowUpIcon } from "@/lib/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";

export function InputGroupBlockEnd() {
  return (
    <div className="w-full max-w-sm">
      <InputGroup>
        <InputGroupTextarea placeholder="Type a message" rows={2} />
        <InputGroupAddon align="block-end" className="justify-end">
          <InputGroupButton size="icon-sm" variant="default">
            <ArrowUpIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
