"use client";

import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function InputGroupDisabled() {
  return (
    <div className="max-w-sm">
      <InputGroup data-disabled="true">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput disabled placeholder="Disabled" />
      </InputGroup>
    </div>
  );
}
