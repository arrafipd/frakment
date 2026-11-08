"use client";

import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function InputGroupInvalid() {
  return (
    <div className="max-w-sm">
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
