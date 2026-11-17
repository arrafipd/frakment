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

export interface ButtonBaseProps extends VariantProps<typeof buttonVariants> {
  anchorRef?: React.Ref<HTMLAnchorElement>;
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  download?: string | boolean;
  href?: string;
  motion?: string;
  rel?: string;
  target?: React.HTMLAttributeAnchorTarget;
}

// biome-ignore lint/suspicious/noExplicitAny: loose polymorphic props for the `as` escape hatch
export type ButtonProps = ButtonBaseProps & Record<string, any>;

function Button({
  as,
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

  let resolvedStyle = style as React.CSSProperties | undefined;
  if (reduce) {
    resolvedStyle = { ...resolvedStyle, transition: "none" };
  } else if (motion !== undefined) {
    const transition = getTransition(parseMotion(motion));
    if (transition) {
      resolvedStyle = { ...resolvedStyle, transition };
    }
  }

  const styleFingerprint = JSON.stringify(resolvedStyle ?? null);
  const yielded = useMotionGuard(internalRef, motionEnabled, styleFingerprint);

  if (yielded && !reduce) {
    resolvedStyle = { ...resolvedStyle, transition: "none" };
  }

  const setRef = React.useCallback(
    (el: HTMLElement | null) => {
      internalRef.current = el;
      if (href !== undefined && anchorRef) {
        if (typeof anchorRef === "function") {
          anchorRef(el as HTMLAnchorElement | null);
        } else {
          (
            anchorRef as React.MutableRefObject<HTMLAnchorElement | null>
          ).current = el as HTMLAnchorElement | null;
        }
      }
      if (typeof ref === "function") {
        (ref as (el: HTMLElement | null) => void)(el);
      } else if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
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

  if (as !== undefined) {
    const allProps: Record<string, unknown> = {
      ...attrs,
      ...props,
      className: classes,
      ref: setRef,
      style: resolvedStyle,
    };
    if (href !== undefined) {
      allProps.href = href;
    }
    if (download !== undefined) {
      allProps.download = download;
    }
    if (rel !== undefined) {
      allProps.rel = rel;
    }
    if (target !== undefined) {
      allProps.target = target;
    }
    return React.createElement(as, allProps, children);
  }

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
      ...anchorRest
    } = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
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
        {...(anchorRest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
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
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}

export { Button };
