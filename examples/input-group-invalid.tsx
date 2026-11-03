"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "@/lib/icons";

export function InputGroupInvalid() {
  return (
    <div className="w-full max-w-sm">
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          aria-invalid
          defaultValue="Not found"
          placeholder="Invalid"
        />
      </InputGroup>
    </div>
  );
}
