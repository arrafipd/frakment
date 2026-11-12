"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { ArrowClockwiseIcon, CheckIcon, CopyIcon } from "@/lib/icons";
import { sampleBezier } from "./motion-curve-preview";

const SAMPLES = 80;
const DURATION = 2.4;
const HOLD = 0.15;

const DEFAULT_BEZIER: [number, number, number, number] = [0.4, 0, 0.2, 1];

interface Point {
  set: (value: number) => void;
  value: number;
  x: number;
  y: number;
}

export function MotionCurveCustom() {
  const { copyToClipboard, isCopied } = useCopyToClipboard({ timeout: 1500 });
  const [x1, setX1] = useState(DEFAULT_BEZIER[0]);
  const [y1, setY1] = useState(DEFAULT_BEZIER[1]);
  const [x2, setX2] = useState(DEFAULT_BEZIER[2]);
  const [y2, setY2] = useState(DEFAULT_BEZIER[3]);

  const bezier: [number, number, number, number] = [x1, y1, x2, y2];
  const bezierString = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;

  const points = useMemo(() => sampleBezier(bezier), [x1, y1, x2, y2]);
  const d =
    "M " +
    points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" L ");
  const cxKf = [
    points[0][0],
    points[0][0],
    ...points.slice(1).map(([x]) => x),
    points[SAMPLES][0],
  ];
  const cyKf = [
    points[0][1],
    points[0][1],
    ...points.slice(1).map(([, y]) => y),
    points[SAMPLES][1],
  ];
  const times = [
    0,
    HOLD,
    ...Array.from(
      { length: SAMPLES },
      (_, i) => HOLD + (1 - 2 * HOLD) * ((i + 1) / SAMPLES)
    ),
    1,
  ];

  const reset = () => {
    setX1(DEFAULT_BEZIER[0]);
    setY1(DEFAULT_BEZIER[1]);
    setX2(DEFAULT_BEZIER[2]);
    setY2(DEFAULT_BEZIER[3]);
  };

  const inputs: Point[] = [
    { set: setX1, value: x1, x: x1, y: y1 },
    { set: setY1, value: y1, x: 0, y: 0 },
    { set: setX2, value: x2, x: x2, y: y2 },
    { set: setY2, value: y2, x: 0, y: 0 },
  ];

  const labels = ["X1", "Y1", "X2", "Y2"];

  return (
    <div className="not-prose border-border bg-background my-6 flex flex-col overflow-hidden rounded border">
      <div className="border-border flex h-[200px] w-full items-center justify-center border-b p-3">
        <svg
          className="text-foreground h-full w-full"
          key={bezierString}
          viewBox="-10 -60 120 220"
        >
          <path
            d={d}
            fill="none"
            opacity="0.35"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <motion.circle
            animate={{ cx: cxKf, cy: cyKf }}
            fill="currentColor"
            initial={{ cx: cxKf[0], cy: cyKf[0] }}
            r="3"
            transition={{
              duration: DURATION,
              ease: "linear",
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              times,
            }}
          />
        </svg>
      </div>

      <div className="border-border grid grid-cols-4 gap-3 border-b px-4 py-3.5">
        {inputs.map((input, i) => (
          <label className="flex flex-col gap-1" key={labels[i]}>
            <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              {labels[i]}
            </span>
            <input
              aria-label={labels[i]}
              className="border-border text-foreground focus:border-foreground/40 w-full [appearance:textfield] rounded border bg-transparent px-2 py-1 font-mono text-xs outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              max={i % 2 === 0 ? 1 : undefined}
              min={i % 2 === 0 ? 0 : undefined}
              onChange={(e) =>
                input.set(Number.parseFloat(e.target.value) || 0)
              }
              step="0.01"
              type="number"
              value={input.value}
            />
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <span className="text-foreground/70 font-mono text-xs">
          {bezierString}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            aria-label="Reset to default"
            className="text-foreground/50 hover:text-foreground border-border flex size-7 shrink-0 items-center justify-center rounded border transition-colors"
            onClick={reset}
            type="button"
          >
            <ArrowClockwiseIcon className="size-3.5" />
          </button>
          <button
            aria-label="Copy cubic-bezier value"
            className="text-foreground/50 hover:text-foreground border-border flex size-7 shrink-0 items-center justify-center rounded border transition-colors"
            onClick={() => copyToClipboard(bezierString)}
            type="button"
          >
            {isCopied ? (
              <CheckIcon className="size-3.5" weight="bold" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
