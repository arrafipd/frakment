"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type SliderOrientation = "horizontal" | "vertical";

interface SliderProps {
  "aria-label"?: string;
  className?: string;
  defaultValue?: number[];
  disabled?: boolean;
  id?: string;
  max?: number;
  min?: number;
  onValueChange?: (value: number[]) => void;
  orientation?: SliderOrientation;
  step?: number;
  value?: number[];
}

function decimalsFor(step: number): number {
  const text = String(step);
  const dot = text.indexOf(".");
  return dot < 0 ? 0 : text.length - dot - 1;
}

function snapToStep(raw: number, step: number): number {
  const decimals = decimalsFor(step);
  const factor = 10 ** decimals;
  return Math.round(raw * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function Slider({
  "aria-label": ariaLabel,
  className,
  defaultValue,
  disabled = false,
  id,
  max = 100,
  min = 0,
  onValueChange,
  orientation = "horizontal",
  step = 1,
  value: valueProp,
}: SliderProps) {
  const isControlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState<number[]>(
    () => defaultValue ?? [min, max]
  );
  const values = isControlled ? valueProp : uncontrolled;
  const trackRef = React.useRef<HTMLDivElement | null>(null);

  const commit = React.useCallback(
    (next: number[]) => {
      if (!isControlled) {
        setUncontrolled(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  const percentOf = (v: number) => {
    const range = Math.max(max - min, Number.EPSILON);
    return ((v - min) / range) * 100;
  };

  const valueFromPointer = (clientX: number, clientY: number): number => {
    const track = trackRef.current;
    if (!track) {
      return min;
    }
    const rect = track.getBoundingClientRect();
    let ratio: number;
    if (orientation === "horizontal") {
      ratio = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;
    } else {
      ratio = rect.height === 0 ? 0 : 1 - (clientY - rect.top) / rect.height;
    }
    ratio = clamp(ratio, 0, 1);
    return snapToStep(min + ratio * (max - min), step);
  };

  const boundsFor = (index: number): [number, number] => {
    const lower = index === 0 ? min : values[index - 1];
    const upper = index === values.length - 1 ? max : values[index + 1];
    return [lower, upper];
  };

  const updateThumb = (index: number, raw: number) => {
    const [lo, hi] = boundsFor(index);
    const next = values.slice();
    next[index] = clamp(raw, lo, hi);
    if (next[index] !== values[index]) {
      commit(next);
    }
  };

  const handlePointerDown =
    (index: number) => (event: React.PointerEvent<HTMLSpanElement>) => {
      if (disabled) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const target = event.currentTarget;
      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        // noop
      }
      updateThumb(index, valueFromPointer(event.clientX, event.clientY));
      const onMove = (ev: PointerEvent) => {
        updateThumb(index, valueFromPointer(ev.clientX, ev.clientY));
      };
      const onUp = () => {
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerup", onUp);
        target.removeEventListener("pointercancel", onUp);
      };
      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", onUp);
      target.addEventListener("pointercancel", onUp);
    };

  const handleKeyDown =
    (index: number) => (event: React.KeyboardEvent<HTMLSpanElement>) => {
      if (disabled) {
        return;
      }
      const [lo, hi] = boundsFor(index);
      const current = values[index];
      let next = current;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowUp":
          next = clamp(snapToStep(current + step, step), lo, hi);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          next = clamp(snapToStep(current - step, step), lo, hi);
          break;
        case "Home":
          next = lo;
          break;
        case "End":
          next = hi;
          break;
        case "PageUp":
          next = clamp(snapToStep(current + step * 10, step), lo, hi);
          break;
        case "PageDown":
          next = clamp(snapToStep(current - step * 10, step), lo, hi);
          break;
        default:
          return;
      }
      event.preventDefault();
      if (next !== current) {
        const arr = values.slice();
        arr[index] = next;
        commit(arr);
      }
    };

  const rangeStart = percentOf(values[0]);
  const rangeEnd = percentOf(values.at(-1) ?? min);
  const rangeStyle: React.CSSProperties =
    orientation === "horizontal"
      ? { left: `${rangeStart}%`, right: `${100 - rangeEnd}%` }
      : { bottom: `${rangeStart}%`, top: `${100 - rangeEnd}%` };

  return (
    <div
      className={cn(
        "relative flex w-full touch-none select-none",
        orientation === "horizontal"
          ? "items-center"
          : "h-full min-h-40 flex-col items-center",
        disabled ? "opacity-50" : undefined,
        className
      )}
      data-disabled={disabled || undefined}
      data-orientation={orientation}
      data-slot="slider"
      id={id}
    >
      <div
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full",
          orientation === "horizontal" ? "h-1 w-full" : "h-full w-1"
        )}
        data-slot="slider-track"
        ref={trackRef}
      >
        <div
          className={cn(
            "bg-primary absolute select-none",
            orientation === "horizontal" ? "inset-y-0" : "inset-x-0"
          )}
          data-slot="slider-range"
          style={rangeStyle}
        />
      </div>
      {values.map((v, index) => {
        const percent = percentOf(v);
        const thumbStyle: React.CSSProperties =
          orientation === "horizontal"
            ? {
                left: `${percent}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
              }
            : {
                bottom: `${percent}%`,
                left: "50%",
                transform: "translate(-50%, 50%)",
              };
        return (
          <span
            aria-disabled={disabled || undefined}
            aria-label={ariaLabel}
            aria-orientation={orientation}
            aria-valuemax={max}
            aria-valuemin={min}
            aria-valuenow={v}
            className={cn(
              "border-primary bg-background ring-ring/50 absolute block size-3.5 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] select-none",
              "after:absolute after:-inset-2",
              "hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3",
              disabled ? "pointer-events-none opacity-50" : "cursor-grab"
            )}
            data-slot="slider-thumb"
            key={`slider-thumb-${index}`}
            onKeyDown={handleKeyDown(index)}
            onPointerDown={handlePointerDown(index)}
            role="slider"
            style={thumbStyle}
            tabIndex={disabled ? -1 : 0}
          />
        );
      })}
    </div>
  );
}

export { Slider };
