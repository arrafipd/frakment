"use client";

import { useTheme } from "next-themes";
import { useCallback } from "react";
import { toast } from "sonner";

import { FrakmentMark } from "@/components/site/brand/frakment-mark";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/site/context-menu";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { DownloadIcon } from "@/lib/icons";

export const BrandContextMenu = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { resolvedTheme } = useTheme();
  const { copyToClipboard } = useCopyToClipboard();

  const logoMarkSvgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="${resolvedTheme === "light" ? "#000000" : "#ffffff"}"><path d="M3109.01 2470H3106.4L3766.11 3129.71L3129.71 3766.11L2470 3106.4V4040H1570V3105.5L909.396 3766.11L273 3129.71L932.712 2470H928.184L2018.59 1379.59L3109.01 2470ZM2470 932.711L3129.71 273L3766.11 909.396L3105.5 1570H4040V2470H3307L2020 1183L2019.07 1183.92L2017.67 1182.52L730.193 2470H0V1570H933.604L273 909.396L909.396 273L1570 933.604V0H2470V932.711Z"/></svg>`;

  const handleCopy = useCallback(() => {
    copyToClipboard(logoMarkSvgString);
    toast.success("Icon as SVG copied");
  }, [logoMarkSvgString, copyToClipboard]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([logoMarkSvgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "icon.svg";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Icon as SVG downloaded");
  }, [logoMarkSvgString]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={handleCopy}>
          <FrakmentMark />
          Copy as SVG
        </ContextMenuItem>

        <ContextMenuItem onClick={handleDownload}>
          <DownloadIcon /> Download as SVG
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
