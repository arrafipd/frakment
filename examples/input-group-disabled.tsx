"use client";

import { Search } from "@/lib/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function InputGroupDisabled() {
  return (
    <div className="w-full max-w-sm">
      <InputGroup data-disabled="true">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput placeholder="Disabled" disabled />
      </InputGroup>
    </div>
  );
}
