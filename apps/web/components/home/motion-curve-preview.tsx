"use client";

import { motion } from "motion/react";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { ComponentDefault, CurveEntry } from "@/lib/animation-curves";
import { CheckIcon, CopyIcon } from "@/lib/icons";

const W = 100;
const H = 100;
const SAMPLES = 80;
const DURATION = 2.4;
const HOLD = 0.15;

type Entry = CurveEntry | ComponentDefault;

export function sampleBezier(
  bezier: [number, number, number, number]
): [number, number][] {
  const [x1, y1, x2, y2] = bezier;
  const points: [number, number][] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const mt = 1 - t;
    const x = 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t;
    const y = 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t;
    points.push([x * W, H - y * H]);
  }
  return points;
}

function sampleSpring(spring: {
  stiffness: number;
  damping: number;
}): [number, number][] {
  const dt = 1 / 240;
  const totalTime = 1.2;
  const steps = Math.floor(totalTime / dt);
  const ys: number[] = [];
  let pos = 0;
  let vel = 0;
  for (let i = 0; i <= steps; i++) {
    const force = -spring.stiffness * (pos - 1) - spring.damping * vel;
    vel += force * dt;
    pos += vel * dt;
    ys.push(pos);
  }
  const points: [number, number][] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const idx = Math.min(steps, Math.floor((i / SAMPLES) * steps));
    points.push([(i / SAMPLES) * W, H - ys[idx] * H]);
  }
  return points;
}
function buildPoints(entry: Entry): [number, number][] {
  if ("type" in entry && entry.type === "spring" && entry.spring) {
    return sampleSpring(entry.spring);
  }
  const bezier =
    "bezier" in entry && entry.bezier
      ? entry.bezier
      : ([0.4, 0, 0.2, 1] as [number, number, number, number]);
  return sampleBezier(bezier);
}

function getLabel(entry: Entry): string {
  return "label" in entry ? entry.label : entry.name;
}

function getMeta(entry: Entry): string {
  if ("type" in entry && entry.type === "spring" && entry.spring) {
    return `${entry.spring.stiffness} / ${entry.spring.damping}`;
  }
  if (
    "duration" in entry &&
    entry.duration !== undefined &&
    entry.name !== "text-morph"
  ) {
    const d = entry.duration;
    if ("bezier" in entry && entry.bezier) {
      const [x1, y1, x2, y2] = entry.bezier;
      return `${d}s · ${x1},${y1},${x2},${y2}`;
    }
    return `${d}s`;
  }
  if ("duration" in entry && entry.duration !== undefined) {
    return `${entry.duration}s`;
  }
  if ("bezier" in entry && entry.bezier) {
    const [x1, y1, x2, y2] = entry.bezier;
    return `${x1}, ${y1}, ${x2}, ${y2}`;
  }
  return "";
}

export function MotionCurvePreview({
  entry,
  copyable = true,
  heightClass = "h-[160px]",
}: {
  entry: Entry;
  copyable?: boolean;
  heightClass?: string;
}) {
  const { copyToClipboard, isCopied } = useCopyToClipboard({ timeout: 1500 });
  const points = buildPoints(entry);
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

  const inner = (
    <>
      <div
        className={`border-border flex ${heightClass} w-full items-center justify-center border-b p-3`}
      >
        <svg
          className="text-foreground h-full w-full"
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
      <div className="flex flex-col gap-1 px-4 py-3.5">
        <span className="text-foreground text-sm font-semibold">
          {getLabel(entry)}
        </span>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="text-foreground/70 font-mono text-[11px]">
            {getMeta(entry)}
          </span>
          {copyable && (
            <span
              aria-hidden="true"
              className="text-foreground/50 group-hover:text-foreground flex size-6 shrink-0 items-center justify-center transition-colors"
            >
              {isCopied ? (
                <CheckIcon className="size-3.5" weight="bold" />
              ) : (
                <CopyIcon className="size-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (!copyable) {
    return (
      <div className="border-border bg-background flex w-full flex-col overflow-hidden rounded border text-left">
        {inner}
      </div>
    );
  }

  return (
    <button
      aria-label={`Copy ${getLabel(entry)}`}
      className="group border-border bg-background hover:border-foreground/40 flex w-full flex-col overflow-hidden rounded border text-left transition-colors"
      onClick={() => copyToClipboard(entry.name)}
      type="button"
    >
      {inner}
    </button>
  );
}
