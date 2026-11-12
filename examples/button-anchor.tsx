"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/utils";

export function ButtonAnchor() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button href="/docs" variant="secondary">
        Static link
      </Button>
      <Link
        className={buttonVariants({ variant: "outline" })}
        href="/docs/components/button"
      >
        Router link
      </Link>
    </div>
  );
}
