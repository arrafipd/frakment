"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export interface ArrowRightIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ArrowRightIconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export const ArrowRightIcon = forwardRef<
  ArrowRightIconHandle,
  ArrowRightIconProps
>(({ className, onMouseEnter, onMouseLeave, size = 18, ...props }, ref) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const controlledRef = useRef(false);

  useImperativeHandle(ref, () => {
    controlledRef.current = true;
    return {
      startAnimation: () => setIsAnimating(true),
      stopAnimation: () => setIsAnimating(false),
    };
  });

  const handleMouseEnter = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (controlledRef.current) {
        onMouseEnter?.(event);
        return;
      }

      setIsAnimating(true);
    },
    [onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (controlledRef.current) {
        onMouseLeave?.(event);
        return;
      }

      setIsAnimating(false);
    },
    [onMouseLeave]
  );

  return (
    <div
      className={cn(className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <svg
        className={cn(isAnimating && "frakment-arrow-right-animate")}
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width={size}
      >
        <path d="M5 12h14" data-arrow-part="shaft" />
        <path d="m12 5 7 7-7 7" data-arrow-part="head" />
      </svg>
    </div>
  );
});

ArrowRightIcon.displayName = "ArrowRightIcon";
