"use client";

import NumberFlow from "@number-flow/react";
import type { Transition, Variants } from "motion/react";
import { AnimatePresence, motion } from "motion/react";
import { Children, useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type TextMorphVariant =
  | "flip"
  | "fade"
  | "blur"
  | "slide"
  | "scale"
  | "count"
  | "roll"
  | "shuffle"
  | "typewriter"
  | "wave";

const defaultVariants: Variants = {
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  initial: { opacity: 0, y: -8 },
};

const slideVariants: Variants = {
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  initial: { opacity: 0, x: 16 },
};

export interface TextMorphProps {
  as?: React.ElementType;
  children: React.ReactNode[];
  className?: string;
  defaultIndex?: number;
  index?: number;
  interval?: number;
  onIndexChange?: (index: number) => void;
  paused?: boolean;
  speed?: number;
  transition?: Transition;
  variant?: TextMorphVariant;
  variants?: Variants;
}
function parseValue(s: string) {
  const match = s.match(/^(\D*)([\d,.]+)(\D*)$/);
  if (!match) {
    return { prefix: "", raw: 0, suffix: "" };
  }
  const [, prefix, num, suffix] = match;
  return {
    prefix: prefix.trim(),
    raw: Number.parseFloat(num.replace(/,/g, "")),
    suffix: suffix.trim(),
  };
}

function ShuffleText({ text, duration }: { text: string; duration: number }) {
  const [display, setDisplay] = useState(text);
  const [prev, setPrev] = useState(text);
  useEffect(() => {
    if (prev === text) {
      return;
    }
    const to = text;
    const len = to.length;
    const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      let out = "";
      for (let i = 0; i < len; i++) {
        const settleAt = ((i + 1) / len) * 0.9;
        if (t >= settleAt) {
          out += to[i];
        } else if (to[i] === " ") {
          out += " ";
        } else {
          out += POOL[Math.floor(Math.random() * POOL.length)];
        }
      }
      setDisplay(out);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
        setPrev(to);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration, prev]);
  return <>{display}</>;
}
function TypewriterText({ text, speed }: { text: string; speed: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) {
        clearInterval(id);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return <>{text.slice(0, count)}</>;
}

function WaveText({ text, speed }: { text: string; speed: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const spans = el.querySelectorAll<HTMLElement>("[data-tf-char]");
    spans.forEach((span) => {
      span.getAnimations().forEach((a) => a.cancel());
    });
    spans.forEach((span, i) => {
      span.style.opacity = "0";
      span.animate([{ opacity: 0 }, { opacity: 1 }], {
        delay: i * speed,
        duration: 250,
        easing: "linear",
        fill: "forwards",
      });
    });
  }, [text, speed]);

  return (
    <span className="relative inline-block whitespace-pre" ref={ref}>
      {text.split("").map((ch, i) => (
        <span
          data-tf-char
          key={i}
          style={{ display: "inline-block", opacity: 0, whiteSpace: "pre" }}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}
export const TextMorph = ({
  as: Component = motion.p,
  variant = "flip",
  className,
  children,
  interval = 2,
  index,
  defaultIndex = 0,
  paused = false,
  transition = { duration: 0.3 },
  variants = defaultVariants,
  onIndexChange,
  speed = 60,
}: TextMorphProps) => {
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const currentIndex = index ?? internalIndex;
  const items = Children.toArray(children).map((c) => String(c));
  const current = items[currentIndex] ?? "";
  const controlled = index !== undefined;

  useEffect(() => {
    if (paused || controlled) {
      return;
    }
    const timer = setInterval(() => {
      setInternalIndex((prev) => {
        const next = (prev + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, interval * 1000);
    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, paused, controlled]);

  if (variant === "count" || variant === "roll") {
    const { raw, prefix, suffix } = parseValue(current);
    return (
      <NumberFlow
        className={className}
        prefix={prefix}
        suffix={suffix}
        value={raw}
      />
    );
  }

  if (variant === "fade" || variant === "blur" || variant === "scale") {
    const styleFor = (i: number): React.CSSProperties => {
      const active = i === currentIndex;
      if (variant === "blur") {
        return {
          filter: active ? "blur(0px)" : "blur(8px)",
          opacity: active ? 1 : 0,
          transition: "opacity 0.6s ease-in-out, filter 0.6s ease-in-out",
        };
      }
      if (variant === "scale") {
        return {
          opacity: active ? 1 : 0,
          transform: active ? "scale(1)" : "scale(0.85)",
          transformOrigin: "center",
          transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
        };
      }
      return {
        opacity: active ? 1 : 0,
        transition: "opacity 0.6s ease-in-out",
      };
    };
    return (
      <Component className={cn("inline-grid", className)}>
        {items.map((item, i) => (
          <span className="col-start-1 row-start-1" key={i} style={styleFor(i)}>
            {item}
          </span>
        ))}
      </Component>
    );
  }
  if (variant === "shuffle") {
    return (
      <Component className={cn("inline-block", className)}>
        <ShuffleText duration={1200} text={current} />
      </Component>
    );
  }

  if (variant === "typewriter") {
    return (
      <Component className={cn("inline-block", className)}>
        <TypewriterText speed={speed} text={current} />
      </Component>
    );
  }

  if (variant === "wave") {
    return (
      <Component className={cn("inline-block", className)}>
        <WaveText speed={speed} text={current} />
      </Component>
    );
  }

  if (variant === "slide") {
    return (
      <Component className={cn("inline-block", className)}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            animate="animate"
            className="inline-block"
            exit="exit"
            initial="initial"
            key={currentIndex}
            transition={transition}
            variants={slideVariants}
          >
            {current}
          </motion.span>
        </AnimatePresence>
      </Component>
    );
  }

  return (
    <Component className={cn("inline-block", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          animate="animate"
          className="inline-block"
          exit="exit"
          initial="initial"
          key={currentIndex}
          transition={transition}
          variants={variants}
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </Component>
  );
};
