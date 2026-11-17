"use client";

import { useEffect, useRef } from "react";

import { useMotionGuard, useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const DEFAULT_DURATION = 900;
const DEFAULT_EASING = "cubic-bezier(0.2, 0, 0.2, 1)";
const STYLE_ID = "frakment-nf-style";
const MASK = "0.15em";

const STYLES = [
  ".frakment-nf{display:inline-block;direction:ltr;white-space:nowrap;line-height:1}",
  ".frakment-nf .digit{display:inline-block;position:relative;width:0.6em;height:1em;overflow:hidden;vertical-align:top;-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 " +
    MASK +
    ",#000 calc(100% - " +
    MASK +
    "),transparent 100%);mask-image:linear-gradient(to bottom,transparent 0,#000 " +
    MASK +
    ",#000 calc(100% - " +
    MASK +
    "),transparent 100%)}",
  ".frakment-nf .digit-num{display:block;position:absolute;top:0;left:0;width:100%;height:1em;text-align:center;line-height:1;will-change:transform}",
  ".frakment-nf .text{display:inline-block}",
  "@keyframes nf-out-up{from{transform:translateY(0)}to{transform:translateY(-100%)}}",
  "@keyframes nf-in-up{from{transform:translateY(100%)}to{transform:translateY(0)}}",
  "@keyframes nf-out-down{from{transform:translateY(0)}to{transform:translateY(100%)}}",
  "@keyframes nf-in-down{from{transform:translateY(-100%)}to{transform:translateY(0)}}",
].join("");

export interface NumberFlowProps {
  className?: string;
  format?: Intl.NumberFormatOptions;
  locales?: Intl.LocalesArgument;
  motion?: string;
  prefix?: string;
  suffix?: string;
  value: number;
}

function parseMotionProp(motion: string | undefined) {
  if (motion === undefined) {
    return { duration: DEFAULT_DURATION, easing: DEFAULT_EASING };
  }
  const parts = motion.trim().split(/\s+/);
  if (!parts[0]) {
    return { duration: DEFAULT_DURATION, easing: DEFAULT_EASING };
  }
  const raw = parts[0];
  const v = Number.parseFloat(raw);
  let duration = DEFAULT_DURATION;
  if (!Number.isNaN(v)) {
    duration = /ms$/.test(raw) ? v : /s$/.test(raw) ? v * 1000 : v;
  }
  return { duration, easing: parts.slice(1).join(" ") || DEFAULT_EASING };
}
function Digit({
  char,
  duration,
  easing,
  reduce,
}: {
  char: string;
  duration: number;
  easing: string;
  reduce: boolean;
}) {
  const curr = Number.parseInt(char, 10);
  const prevRef = useRef(curr);
  const prev = prevRef.current;
  const changed = prev !== curr;

  let delta = curr - prev;
  if (delta > 5) {
    delta -= 10;
  } else if (delta < -5) {
    delta += 10;
  }
  const dir = delta >= 0 ? "up" : "down";
  const animKey = `${prev}-${curr}`;

  useEffect(() => {
    if (!changed) {
      return;
    }
    const t = setTimeout(() => {
      prevRef.current = curr;
    }, duration);
    return () => clearTimeout(t);
  }, [changed, curr, duration]);

  return (
    <span className="digit">
      {changed && !reduce && (
        <span
          className="digit-num"
          key={`out-${animKey}`}
          style={{
            animation: `nf-out-${dir} ${duration}ms ${easing} forwards`,
          }}
        >
          {prev}
        </span>
      )}
      <span
        className="digit-num"
        key={`in-${animKey}`}
        style={{
          animation:
            changed && !reduce
              ? `nf-in-${dir} ${duration}ms ${easing} forwards`
              : "none",
        }}
      >
        {curr}
      </span>
    </span>
  );
}
function NumberFlow({
  className,
  format,
  locales,
  motion,
  prefix,
  suffix,
  value,
}: NumberFlowProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = STYLES;
    document.head.appendChild(el);
  }, []);

  const fingerprint = JSON.stringify({ motion });
  const yielded = useMotionGuard(
    ref,
    motion !== undefined && !reduce,
    fingerprint
  );
  const disabled = reduce || yielded || motion === "off";
  const { duration, easing } = disabled
    ? { duration: 0, easing: "linear" }
    : parseMotionProp(motion);

  const formatted = new Intl.NumberFormat(locales, format).format(value);
  const display = `${prefix ?? ""}${formatted}${suffix ?? ""}`;

  return (
    <span
      aria-label={display}
      className={cn("frakment-nf tabular-nums", className)}
      ref={ref}
    >
      <span aria-hidden="true">
        {prefix ? <span className="text">{prefix}</span> : null}
        {formatted.split("").map((char, i) => {
          const isDigit = char >= "0" && char <= "9";
          if (isDigit) {
            return (
              <Digit
                char={char}
                duration={duration}
                easing={easing}
                key={i}
                reduce={disabled}
              />
            );
          }
          return (
            <span className="text" key={i}>
              {char}
            </span>
          );
        })}
        {suffix ? <span className="text">{suffix}</span> : null}
      </span>
    </span>
  );
}

export { NumberFlow };
