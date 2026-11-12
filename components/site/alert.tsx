import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-foreground *:data-[slot=alert-description]:text-foreground/70 border-destructive/30 bg-destructive/5 [&>svg]:text-destructive",
        info: "text-foreground *:data-[slot=alert-description]:text-foreground/70 border-border bg-muted [&>svg]:text-muted-foreground",
        success:
          "text-foreground *:data-[slot=alert-description]:text-foreground/70 border-emerald-500/25 bg-emerald-500/5 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400",
        warning:
          "text-foreground *:data-[slot=alert-description]:text-foreground/70 border-amber-500/25 bg-amber-500/5 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
      },
    },
  }
);

const Alert = ({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) => (
  <div
    className={cn(alertVariants({ variant }), className)}
    data-slot="alert"
    role="alert"
    {...props}
  />
);

const AlertTitle = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "col-start-2 line-clamp-1 min-h-4 text-sm font-medium tracking-tight",
      className
    )}
    data-slot="alert-title"
    {...props}
  />
);

const AlertDescription = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
      className
    )}
    data-slot="alert-description"
    {...props}
  />
);

export { Alert, AlertDescription, AlertTitle };
