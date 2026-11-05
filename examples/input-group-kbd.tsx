"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "@/lib/icons";

export function InputGroupKbd() {
  return (
    <div className="max-w-sm">
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon align="inline-end">
          <kbd>Ctrl K</kbd>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
