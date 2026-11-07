import { DURATION_FAST, EASE_OUT } from "@/lib/animation";

export const MESSAGE_ANIMATIONS = {
  fade: {
    transition: { duration: DURATION_FAST },
    variants: {
      animate: { opacity: 1 },
      initial: { opacity: 0 },
    },
  },
  "slide-up": {
    transition: { duration: DURATION_FAST + 0.1, ease: EASE_OUT },
    variants: {
      animate: { opacity: 1, y: 0 },
      initial: { opacity: 0, y: 8 },
    },
  },
  "slide-up-slow": {
    transition: { duration: 0.32, ease: EASE_OUT },
    variants: {
      animate: { opacity: 1, y: 0 },
      initial: { opacity: 0, y: 12 },
    },
  },
} as const;

export type MessageAnimation = keyof typeof MESSAGE_ANIMATIONS;
