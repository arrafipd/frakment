"use client";

import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

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
