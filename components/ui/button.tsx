import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 disabled:bg-muted disabled:text-muted-foreground inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: { size: "default", variant: "default" },
    variants: {
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        icon: "size-9",
        "icon-lg": "size-10",
        "icon-sm": "size-8",
        "icon-xs": "size-7",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        xs: "h-7 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5",
      },
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
        destructive:
          "bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 text-white shadow-xs",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        outline:
          "hover:bg-accent hover:text-accent-foreground dark:border-input dark:hover:bg-input/50 border shadow-xs",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs",
      },
    },
  }
);

export interface ButtonProps
  extends Omit<React.ComponentProps<"button">, "ref">,
    VariantProps<typeof buttonVariants> {
  /** Ref for the underlying `<a>` element. Only used when `href` is set. */
  anchorRef?: React.Ref<HTMLAnchorElement>;
  download?: string | boolean;
  /**
   * When set, the component renders a native `<a>` element instead of a `<button>`.
   *
   * In anchor mode, `type`, `disabled`, `form*`, `name`, and `value` are ignored.
   * Use `anchorRef` (not `ref`) to access the underlying anchor element.
   */
  href?: string;
  /** Ref for the underlying `<button>` element. Ignored when `href` is set. */
  ref?: React.Ref<HTMLButtonElement>;
  rel?: string;
  target?: React.HTMLAttributeAnchorTarget;
}

function Button({
  className,
  variant,
  size,
  href,
  target,
  rel,
  download,
  ref,
  anchorRef,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ className, size, variant }));
  const attrs = {
    "data-inline": true,
    "data-size": size,
    "data-slot": "button",
    "data-variant": variant,
  } as const;

  if (href !== undefined) {
    const {
      type: _t,
      disabled: _d,
      form: _f,
      formAction: _fa,
      formEncType: _fe,
      formMethod: _fm,
      formNoValidate: _fnv,
      formTarget: _ft,
      name: _n,
      value: _v,
      ...rest
    } = props;
    return (
      <a
        className={classes}
        download={download}
        href={href}
        ref={anchorRef}
        rel={rel}
        target={target}
        {...attrs}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button className={classes} ref={ref} {...attrs} {...props}>
      {children}
    </button>
  );
}

export { Button, buttonVariants };
