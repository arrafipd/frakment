"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import {
  getTransition,
  parseMotion,
  useMotionGuard,
  useReducedMotion,
} from "@/lib/motion";
import { buttonVariants, cn } from "@/lib/utils";

export interface ButtonProps
  extends Omit<React.ComponentProps<"button">, "ref">,
    VariantProps<typeof buttonVariants> {
  anchorRef?: React.Ref<HTMLAnchorElement>;
  download?: string | boolean;
  href?: string;
  motion?: string;
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
  motion,
  style,
  children,
  ...props
}: ButtonProps) {
  const reduce = useReducedMotion();
  const internalRef = React.useRef<HTMLElement | null>(null);

  const motionEnabled = motion !== undefined && !reduce;

  let resolvedStyle = style;
  if (reduce) {
    resolvedStyle = { ...style, transition: "none" };
  } else if (motion !== undefined) {
    const transition = getTransition(parseMotion(motion));
    if (transition) {
      resolvedStyle = { ...style, transition };
    }
  }

  const styleFingerprint = JSON.stringify(resolvedStyle ?? null);
  const yielded = useMotionGuard(internalRef, motionEnabled, styleFingerprint);

  if (yielded && !reduce) {
    resolvedStyle = { ...style, transition: "none" };
  }

  const setRef = React.useCallback(
    (el: HTMLElement | null) => {
      internalRef.current = el;
      if (href !== undefined) {
        if (typeof anchorRef === "function") {
          anchorRef(el as HTMLAnchorElement | null);
        } else if (anchorRef) {
          (
            anchorRef as React.MutableRefObject<HTMLAnchorElement | null>
          ).current = el as HTMLAnchorElement | null;
        }
      } else if (typeof ref === "function") {
        ref(el as HTMLButtonElement | null);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
          el as HTMLButtonElement | null;
      }
    },
    [href, ref, anchorRef]
  );

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
        ref={setRef}
        rel={rel}
        style={resolvedStyle}
        target={target}
        {...attrs}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={classes}
      ref={setRef}
      style={resolvedStyle}
      {...attrs}
      {...props}
    >
      {children}
    </button>
  );
}

export { Button };
