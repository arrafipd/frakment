"use client";

import {
  SiAmericanexpress,
  SiDinersclub,
  SiDiscover,
  SiJcb,
  SiMastercard,
  SiVisa,
} from "@icons-pack/react-simple-icons";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "motion/react";
import type * as React from "react";
import {
  delayTight,
  durationSlow,
  easeInOutQuad,
  parseAnimation,
} from "@/lib/animation";
import { cn } from "@/lib/utils";

type CardBrand = "mastercard" | "visa" | "amex" | "discover" | "jcb" | "diners";

const creditCardVariants = cva(
  "relative flex aspect-[1.586] w-full max-w-sm flex-col justify-between overflow-hidden rounded-xl p-4 sm:p-5",
  {
    defaultVariants: { variant: "default" },
    variants: {
      variant: {
        default:
          "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
        glass:
          "bg-neutral-900/20 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.22),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.22),transparent_45%)] text-neutral-900 shadow-2xl backdrop-blur-[80px] dark:bg-white/20 dark:text-neutral-100",
      },
    },
  }
);

const brandIcons = {
  amex: SiAmericanexpress,
  diners: SiDinersclub,
  discover: SiDiscover,
  jcb: SiJcb,
  mastercard: SiMastercard,
  visa: SiVisa,
} as const;

export function detectBrand(cardNumber: string): CardBrand {
  const clean = cardNumber.replace(/\s/g, "");
  if (/^4/.test(clean)) {
    return "visa";
  }
  if (/^(5[1-5]|2[2-7])/.test(clean)) {
    return "mastercard";
  }
  if (/^3[47]/.test(clean)) {
    return "amex";
  }
  if (/^(6011|65|64[4-9])/.test(clean)) {
    return "discover";
  }
  if (/^35/.test(clean)) {
    return "jcb";
  }
  if (/^(30|36|38)/.test(clean)) {
    return "diners";
  }
  return "mastercard";
}

export function formatCardNumber(
  cardNumber: string,
  brand: CardBrand,
  masked = false
): string {
  const clean = cardNumber.replace(/\s/g, "");
  if (masked) {
    const last4 = clean.slice(-4);
    if (brand === "amex") {
      return `•••• •••••• ${last4}`;
    }
    return `•••• •••• •••• ${last4}`;
  }
  if (brand === "amex") {
    return [clean.slice(0, 4), clean.slice(4, 10), clean.slice(10, 15)]
      .filter(Boolean)
      .join(" ");
  }
  if (brand === "diners") {
    return [clean.slice(0, 4), clean.slice(4, 10), clean.slice(10, 14)]
      .filter(Boolean)
      .join(" ");
  }
  return [
    clean.slice(0, 4),
    clean.slice(4, 8),
    clean.slice(8, 12),
    clean.slice(12, 16),
  ]
    .filter(Boolean)
    .join(" ");
}

export function formatExpiry(expiry: string): string {
  const clean = expiry.replace(/\D/g, "");
  if (clean.length <= 2) {
    return clean;
  }
  return `${clean.slice(0, 2)}/${clean.slice(2, 4)}`;
}

function BrandLogo({ brand }: { brand: CardBrand }) {
  const Icon = brandIcons[brand];
  return <Icon aria-label={brand} className="size-6 sm:size-8" />;
}

function CreditCard({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof creditCardVariants>) {
  return (
    <div
      className={cn(creditCardVariants({ variant }), className)}
      data-slot="credit-card"
      {...props}
    />
  );
}

function CreditCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    />
  );
}

function CreditCardIssuer({
  className,
  children,
  logo,
  ...props
}: React.ComponentProps<"div"> & {
  logo?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center", className)} {...props}>
      {children ?? logo ?? null}
    </div>
  );
}

function CreditCardBrand({
  className,
  brand,
  children,
  ...props
}: React.ComponentProps<"div"> & { brand?: CardBrand }) {
  return (
    <div className={cn("flex items-center", className)} {...props}>
      {children ?? (brand ? <BrandLogo brand={brand} /> : null)}
    </div>
  );
}

function CreditCardNumber({
  className,
  value,
  brand,
  masked = false,
  animation,
  duration = durationSlow,
  stagger = delayTight,
  ...props
}: React.ComponentProps<"p"> & {
  value: string;
  brand?: CardBrand;
  masked?: boolean;
  animation?: false | string;
  duration?: number;
  stagger?: number;
}) {
  const resolvedBrand = brand ?? detectBrand(value);
  const fullText = formatCardNumber(value, resolvedBrand, false);
  const maskedText = formatCardNumber(value, resolvedBrand, true);
  const displayText = masked ? maskedText : fullText;
  const prefersReduced = useReducedMotion();
  const baseClass = cn(
    "overflow-hidden font-mono text-sm tracking-[0.1em] whitespace-nowrap tabular-nums sm:text-lg sm:tracking-[0.15em]",
    className
  );

  if (animation === false) {
    return (
      <p className={baseClass} {...props}>
        {displayText}
      </p>
    );
  }

  const anim = parseAnimation(animation);
  const baseTransition = prefersReduced
    ? { duration: 0 }
    : (anim?.transition ?? { duration, ease: easeInOutQuad });

  const maxLen = Math.max(fullText.length, maskedText.length);
  const chars: React.ReactNode[] = [];
  for (let i = 0; i < maxLen; i++) {
    const fullChar = fullText[i] ?? " ";
    const maskedChar = maskedText[i] ?? " ";
    const isSpace = fullChar === " " && maskedChar === " ";
    const delay = i * stagger;
    chars.push(
      <span
        className="relative inline-flex h-[1.2em] w-[1ch] items-center justify-center"
        key={i}
      >
        <motion.span
          animate={{
            filter: masked ? "blur(6px)" : "blur(0px)",
            opacity: masked ? 0 : 1,
            scale: masked ? 0.15 : 1,
          }}
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          initial={false}
          transition={{ ...baseTransition, delay }}
        >
          {isSpace ? "\u00A0" : fullChar}
        </motion.span>
        <motion.span
          animate={{
            filter: masked ? "blur(0px)" : "blur(6px)",
            opacity: masked ? 1 : 0,
            scale: masked ? 1 : 0.15,
          }}
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          initial={false}
          transition={{ ...baseTransition, delay }}
        >
          {isSpace ? "\u00A0" : maskedChar}
        </motion.span>
      </span>
    );
  }

  return (
    <p aria-label={displayText} className={baseClass} {...props}>
      <span aria-hidden="true" className="inline-flex">
        {chars}
      </span>
    </p>
  );
}

function CreditCardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-end justify-between gap-4", className)}
      {...props}
    />
  );
}

function CreditCardHolder({
  className,
  label = "Card holder",
  value,
  ...props
}: React.ComponentProps<"div"> & { label?: string; value: string }) {
  return (
    <div className={cn("space-y-0.5 sm:space-y-1", className)} {...props}>
      <p className="text-[9px] tracking-wider uppercase opacity-60 sm:text-[10px]">
        {label}
      </p>
      <p className="text-[10px] font-medium uppercase sm:text-xs">{value}</p>
    </div>
  );
}

function CreditCardExpiry({
  className,
  label = "Expires",
  value,
  ...props
}: React.ComponentProps<"div"> & { label?: string; value: string }) {
  return (
    <div
      className={cn("space-y-0.5 text-right sm:space-y-1", className)}
      {...props}
    >
      <p className="text-[9px] tracking-wider uppercase opacity-60 sm:text-[10px]">
        {label}
      </p>
      <p className="text-[10px] font-medium sm:text-xs">
        {formatExpiry(value)}
      </p>
    </div>
  );
}

export {
  type CardBrand,
  CreditCard,
  CreditCardBrand,
  CreditCardExpiry,
  CreditCardFooter,
  CreditCardHeader,
  CreditCardHolder,
  CreditCardIssuer,
  CreditCardNumber,
  creditCardVariants,
};
