"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ButtonAnchor() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button href="/docs" variant="secondary">
        Static link
      </Button>
      <Button as={Link} href="/docs/components/button" variant="outline">
        Router link
      </Button>
    </div>
  );
}
