"use client";

import NumberFlow from "@number-flow/react";
import {
  RotateCwIcon as ArrowClockwiseIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function TextMorphRoll() {
  const [count, setCount] = useState(60);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) {
      return;
    }
    const id = setInterval(() => {
      setCount((c) => (c === 0 ? 60 : c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [paused]);

  const reset = () => {
    setCount(60);
    setPaused(false);
  };

  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="text-7xl font-semibold tracking-tight tabular-nums sm:text-8xl">
        <NumberFlow
          format={{ minimumIntegerDigits: 2 }}
          prefix="0:"
          value={count}
        />
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          aria-label={paused ? "Play" : "Pause"}
          className="bg-muted text-foreground flex size-10 items-center justify-center rounded-full"
          onClick={() => setPaused((p) => !p)}
          type="button"
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence initial={false} mode="wait">
            {paused ? (
              <motion.span
                animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
                className="inline-flex"
                exit={{ filter: "blur(4px)", opacity: 0, scale: 0.5 }}
                initial={{ filter: "blur(4px)", opacity: 0, scale: 0.5 }}
                key="play"
                transition={{ duration: 0.1 }}
              >
                <PlayIcon />
              </motion.span>
            ) : (
              <motion.span
                animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
                className="inline-flex"
                exit={{ filter: "blur(4px)", opacity: 0, scale: 0.5 }}
                initial={{ filter: "blur(4px)", opacity: 0, scale: 0.5 }}
                key="pause"
                transition={{ duration: 0.1 }}
              >
                <PauseIcon />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        <motion.button
          aria-label="Reset"
          className="bg-muted text-foreground flex size-10 items-center justify-center rounded-full"
          onClick={reset}
          type="button"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowClockwiseIcon />
        </motion.button>
      </div>
    </div>
  );
}
