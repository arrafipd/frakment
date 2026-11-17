import { cn } from "@/lib/utils";

const Kbd = ({ className, ...props }: React.ComponentProps<"kbd">) => (
  <kbd
    className={cn(
      "text-xs/none text-muted-foreground pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm px-1 font-sans font-normal select-none [&_svg:not([class*='size-'])]:size-3",
      "bg-muted shadow-foreground/10 shadow-[inset_0_-1px_2px]",
      "in-data-[slot=tooltip-content]:text-background in-data-[slot=tooltip-content]:bg-white/20 in-data-[slot=tooltip-content]:shadow-white/20 dark:in-data-[slot=tooltip-content]:bg-black/10 dark:in-data-[slot=tooltip-content]:shadow-black/10",
      className
    )}
    data-slot="kbd"
    {...props}
  />
);

const KbdGroup = ({ className, ...props }: React.ComponentProps<"div">) => (
  <kbd
    className={cn("inline-flex items-center gap-1", className)}
    data-slot="kbd-group"
    {...props}
  />
);

export { Kbd, KbdGroup };
