"use client";

import { SiExpo } from "@icons-pack/react-simple-icons";
import Link from "next/link";
import type * as React from "react";

import { FrakmentMark } from "@/components/site/brand";
import { source } from "@/lib/source";
import { cn } from "@/lib/utils";

const BASES: ReadonlyArray<{
  icon: React.ComponentType<{ className?: string; size?: number }>;
  name: "web" | "native";
  title: string;
}> = [
  { icon: FrakmentMark, name: "web", title: "Web" },
  { icon: SiExpo, name: "native", title: "Native" },
];

export function DocsBaseSwitcher({
  base,
  component,
  section = "components",
  className,
}: {
  base: string;
  component: string;
  section?: "components";
  className?: string;
}) {
  const activeBase = BASES.find((b) => b.name === base);
  const ActiveIcon = activeBase?.icon;

  return (
    <div
      className={cn(
        "not-typeset inline-flex w-full items-center gap-4",
        className
      )}
    >
      {BASES.filter((b) => source.getPage([section, b.name, component])).map(
        (b) => (
          <Link
            className="text-muted-foreground after:bg-foreground hover:text-foreground data-[active=true]:text-foreground relative inline-flex items-center justify-center gap-1 pt-1 pb-0.5 text-base font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:opacity-0 after:transition-opacity data-[active=true]:after:opacity-100"
            data-active={base === b.name}
            href={`/docs/${section}/${b.name}/${component}`}
            key={b.name}
          >
            {b.title}
          </Link>
        )
      )}
      {ActiveIcon && (
        <div className="text-muted-foreground ml-auto shrink-0 opacity-80">
          <ActiveIcon size={16} />
        </div>
      )}
    </div>
  );
}
