"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export interface ShareIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ShareIconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export const ShareIcon = forwardRef<ShareIconHandle, ShareIconProps>(
  ({ className, onMouseEnter, onMouseLeave, size = 20, ...props }, ref) => {
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
          className="overflow-visible"
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
        >
          <g
            className="transition-transform duration-200 ease-out motion-reduce:transition-none"
            style={{ transform: isAnimating ? "translateY(-2px)" : undefined }}
          >
            <path d="M12 2v13" />
            <path d="m16 6-4-4-4 4" />
          </g>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        </svg>
      </div>
    );
  }
);

ShareIcon.displayName = "ShareIcon";
