"use client";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { CheckIcon, CopyIcon } from "@/lib/icons";

interface BrandColorSwatchProps {
  hex: string;
  name: string;
  rgb?: string;
}

export function BrandColorSwatch({ name, hex, rgb }: BrandColorSwatchProps) {
  const { copyToClipboard, isCopied } = useCopyToClipboard({
    timeout: 1500,
  });

  return (
    <button
      aria-label={`Copy ${name} hex value`}
      className="group border-border bg-background hover:border-foreground/40 flex w-full flex-col overflow-hidden rounded border text-left transition-colors"
      onClick={() => copyToClipboard(hex)}
      type="button"
    >
      <div
        className="border-border h-[120px] w-full border-b"
        style={{ backgroundColor: hex }}
      />
      <div className="flex flex-col gap-1 px-4 py-3.5">
        <span className="text-foreground text-sm font-semibold">{name}</span>
        {rgb && (
          <span className="text-foreground/70 text-[13px]">RGB {rgb}</span>
        )}
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="text-foreground font-mono text-[13px]">{hex}</span>
          <span
            aria-hidden="true"
            className="text-foreground/50 group-hover:text-foreground flex size-6 items-center justify-center transition-colors"
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
