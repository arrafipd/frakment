"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export interface ArrowLeftIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ArrowLeftIconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export const ArrowLeftIcon = forwardRef<
  ArrowLeftIconHandle,
  ArrowLeftIconProps
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
        className={cn(isAnimating && "frakment-arrow-left-animate")}
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width={size}
      >
        <path d="m12 19-7-7 7-7" data-arrow-part="head" />
        <path d="M19 12H5" data-arrow-part="shaft" />
      </svg>
    </div>
  );
});

ArrowLeftIcon.displayName = "ArrowLeftIcon";
