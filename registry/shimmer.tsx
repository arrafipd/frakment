import type * as React from "react";

import { cn } from "@/lib/utils";

export function Shimmer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("shimmer", className)}>{children}</span>;
}
