"use client";

import { motion } from "motion/react";
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
    <motion.span
      animate={{ backgroundPosition: ["220% 0", "-220% 0"] }}
      className={cn("inline-block", className)}
      style={{
        backgroundClip: "text",
        backgroundImage:
          "linear-gradient(90deg, var(--foreground) 0%, var(--foreground) 35%, var(--foreground) 45%, color-mix(in oklab, var(--foreground) 50%, transparent) 50%, var(--foreground) 55%, var(--foreground) 65%, var(--foreground) 100%)",
        backgroundSize: "220% 100%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        willChange: "background-position",
      }}
      transition={{
        duration: 2.8,
        ease: [0.4, 0, 0.6, 1],
        repeat: Number.POSITIVE_INFINITY,
      }}
    >
      {children}
    </motion.span>
  );
}
