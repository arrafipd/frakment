/**
 * Blink helpers extracted from components/orbs.tsx.
 *
 * The pill blink is a CSS animation of 21 keyframes over BLINK_HOLD ms:
 * 150 ms of closing and opening (a sine curve), then a hold that keeps
 * the last value. One animation per eye per cycle; no per-frame work.
 *
 * Identical to the original closure functions. The only change is
 * `dropBlinks` uses `for...of` instead of `forEach` (semantic
 * equivalent, passes lint without a disable header).
 */

import { clamp01 } from "./math";

/* the pill's blink on the compositor: its lid closes and opens on the
   frame's curve (1 - 0.94 sin(pi p) over 150 ms, sampled every 7.5 ms)
   from where it stands, then holds open until the next blink replaces
   it (an animation that ends costs main-thread frames of its own). The
   frame drops the hold whenever it writes the eyes, and finishes a
   blink itself when the lids are moving (an expression's tween) */
export const BLINK_MS = 150;
export const BLINK_HOLD = 6000;
export const BLINK = Array.from(
  { length: 21 },
  (_, i) => 1 - 0.94 * Math.sin((Math.PI * i) / 20)
);

export interface BlinkEye {
  blink: Animation | null;
  lid: HTMLElement;
}

export interface BlinkFace {
  /** start time of the current blink */
  blinkAt: number;
  /** face morph progress, 0..1 */
  e: number;
  eyes: BlinkEye[];
  /** lid scale per eye, from the current expression */
  lids: [number, number];
}

export const blinkLids = (face: BlinkFace): void => {
  for (const [i, eye] of face.eyes.entries()) {
    const v = clamp01((face.e - 0.5) / 0.35) * face.lids[i];
    eye.blink?.cancel();
    const keyframes = BLINK.map((k, j) => ({
      offset: (j * BLINK_MS) / 20 / BLINK_HOLD,
      transform: `scaleY(${(v * k).toFixed(3)})`,
    }));
    keyframes.push({ offset: 1, transform: `scaleY(${v.toFixed(3)})` });
    eye.blink = eye.lid.animate(keyframes, { duration: BLINK_HOLD });
    eye.blink.startTime = face.blinkAt;
  }
};

export const blinking = (face: BlinkFace): boolean =>
  face.eyes.some((eye) => {
    if (!eye.blink) {
      return false;
    }
    const ct = eye.blink.currentTime;
    if (ct === null) {
      // original JS: null < BLINK_MS is true
      return true;
    }
    return Number(ct) < BLINK_MS;
  });

export const dropBlinks = (face: BlinkFace): void => {
  for (const eye of face.eyes) {
    eye.blink?.cancel();
    eye.blink = null;
  }
};
