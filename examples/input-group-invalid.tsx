"use client";

import { Search } from "@/lib/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function InputGroupInvalid() {
  return (
    <div className="w-full max-w-sm">
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput placeholder="Invalid" aria-invalid defaultValue="Not found" />
      </InputGroup>
    </div>
  );
}
