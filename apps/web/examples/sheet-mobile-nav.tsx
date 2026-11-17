"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SheetMobileNav() {
  return (
    <Sheet>
      <SheetTrigger as={Button} variant="outline">
        Open menu
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 pt-4">
          <a className="text-sm" href="/docs">
            Docs
          </a>
          <a className="text-sm" href="/changelog">
            Changelog
          </a>
          <a className="text-sm" href="/github">
            GitHub
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
