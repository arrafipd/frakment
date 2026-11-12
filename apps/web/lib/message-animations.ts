import { durationFast, easeOutExpo } from "@/lib/animation";

export const MESSAGE_ANIMATIONS = {
  fade: {
    transition: { duration: durationFast },
    variants: {
      animate: { opacity: 1 },
      initial: { opacity: 0 },
    },
  },
  "slide-up": {
    transition: { duration: durationFast + 0.1, ease: easeOutExpo },
    variants: {
      animate: { opacity: 1, y: 0 },
      initial: { opacity: 0, y: 8 },
    },
  },
  "slide-up-slow": {
    transition: { duration: 0.32, ease: easeOutExpo },
    variants: {
      animate: { opacity: 1, y: 0 },
      initial: { opacity: 0, y: 12 },
    },
  },
} as const;

export type MessageAnimation = keyof typeof MESSAGE_ANIMATIONS;
