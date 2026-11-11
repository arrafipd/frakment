"use client";

import { ArrowRightIcon, Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

export function InputGroupDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search..." />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Enter email" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" variant="default">
            <ArrowRightIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
