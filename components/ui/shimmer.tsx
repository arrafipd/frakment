import type * as React from "react";

import { cn } from "@/lib/utils";

export function Shimmer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-block", className)}
      style={{
        animation: "shimmer 1.6s linear infinite",
        backgroundClip: "text",
        backgroundImage:
          "linear-gradient(90deg, var(--muted-foreground) 0%, var(--muted-foreground) 35%, var(--foreground) 50%, var(--muted-foreground) 65%, var(--muted-foreground) 100%)",
        backgroundPosition: "0% 0",
        backgroundSize: "200% 100%",
        color: "transparent",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {children}
    </span>
  );
}
