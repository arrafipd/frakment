"use client";

import { useTheme } from "next-themes";
import * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "@/lib/icons";

const Toaster = ({ position, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const [responsive, setResponsive] = React.useState<ToasterProps["position"]>(
    position ?? "top-center"
  );
  React.useEffect(() => {
    if (position) {
      return;
    }
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () =>
      setResponsive(mq.matches ? "bottom-right" : "top-center");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [position]);

  return (
    <Sonner
      className="toaster group"
      icons={{
        error: (
          <div className="bg-destructive/10 text-destructive flex size-7 items-center justify-center rounded-lg">
            <OctagonXIcon className="size-4" />
          </div>
        ),
        info: (
          <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <InfoIcon className="size-4" />
          </div>
        ),
        loading: (
          <div className="bg-muted flex size-7 items-center justify-center rounded-lg">
            <Loader2Icon className="size-4 animate-spin" />
          </div>
        ),
        success: (
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CircleCheckIcon className="size-4" />
          </div>
        ),
        warning: (
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <TriangleAlertIcon className="size-4" />
          </div>
        ),
      }}
      position={position ?? responsive}
      style={
        {
          "--border-radius": "var(--radius)",
          "--normal-bg": "var(--surface)",
          "--normal-border": "transparent",
          "--normal-text": "var(--surface-foreground)",
        } as React.CSSProperties
      }
      theme={theme as ToasterProps["theme"]}
      toastOptions={{
        classNames: {
          actionButton:
            "!bg-foreground !text-background !h-7 !px-3 !text-xs !rounded-md !font-medium hover:!bg-foreground/90 !transition-colors",
          cancelButton:
            "!bg-muted !text-foreground !h-7 !px-3 !text-xs !rounded-md",
          closeButton:
            "!bg-transparent !border-0 !text-muted-foreground/60 hover:!text-foreground !-right-1 !-top-1",
          content: "!flex-1 !min-w-0 !gap-0.5",
          description: "!text-xs !text-muted-foreground !leading-snug !mt-0.5",
          title: "!text-[13px] !font-medium !leading-tight !tracking-tight",
          toast:
            "cn-toast !flex !items-center !gap-3 !w-[360px] !p-3.5 !rounded-xl !bg-surface !text-surface-foreground !border-0 !shadow-[0_10px_40px_-10px_rgba(0,0,0,0.18)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
