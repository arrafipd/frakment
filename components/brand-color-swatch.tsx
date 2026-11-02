"use client";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { CheckIcon, CopyIcon } from "@/lib/icons";

interface BrandColorSwatchProps {
  name: string;
  hex: string;
  rgb?: string;
}

export function BrandColorSwatch({ name, hex, rgb }: BrandColorSwatchProps) {
  const { copyToClipboard, isCopied } = useCopyToClipboard({
    timeout: 1500,
  });

  return (
    <button
      type="button"
      onClick={() => copyToClipboard(hex)}
      aria-label={`Copy ${name} hex value`}
      className="group flex w-full flex-col overflow-hidden rounded border border-border bg-background text-left transition-colors hover:border-foreground/40"
    >
      <div
        className="h-[120px] w-full border-b border-border"
        style={{ backgroundColor: hex }}
      />
      <div className="flex flex-col gap-1 px-4 py-3.5">
        <span className="text-sm font-semibold text-foreground">{name}</span>
        {rgb && (
          <span className="text-[13px] text-foreground/70">RGB {rgb}</span>
        )}
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="font-mono text-[13px] text-foreground">{hex}</span>
          <span
            className="flex size-6 items-center justify-center text-foreground/50 transition-colors group-hover:text-foreground"
            aria-hidden="true"
          >
            {isCopied ? (
              <CheckIcon className="size-3.5" weight="bold" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
          </span>
        </div>
      </div>
    </button>
  );
}
