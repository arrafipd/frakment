"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";

export function ComponentPreviewTabs({
  className,
  previewClassName,
  align = "center",
  hideCode = false,
  component,
  source,
  ...props
}: React.ComponentProps<"div"> & {
  previewClassName?: string;
  align?: "center" | "start" | "end";
  hideCode?: boolean;
  component: React.ReactNode;
  source: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group relative mt-4 mb-12 flex flex-col overflow-hidden rounded-2xl border",
        className
      )}
      data-not-typeset
      data-slot="component-preview"
      {...props}
    >
      <div data-slot="preview" dir="ltr">
        <div
          className={cn(
            "preview relative flex h-72 w-full items-center justify-center p-10 data-[align=end]:items-start data-[align=start]:items-start sm:data-[align=end]:items-end",
            previewClassName
          )}
          data-align={align}
        >
          {component}
        </div>
      </div>

      {!hideCode && (
        <div
          className="relative overflow-hidden [&_[data-rehype-pretty-code-figure]]:m-0! [&_[data-rehype-pretty-code-figure]]:rounded-t-none [&_[data-rehype-pretty-code-figure]]:border-t [&_pre]:max-h-72"
          data-slot="code"
        >
          {source}
        </div>
      )}
    </div>
  );
}
