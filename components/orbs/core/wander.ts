/**
 * Wander helpers extracted from components/orbs.tsx.
 *
 * A settled face with no pointer samples the wander curve every 100 ms
 * for 20 seconds, turns those samples into rotate keyframes, and hands
 * the whole 20-second batch to the CSS compositor as one Animation. The
 * next batch is baked when the current one finishes (onfinish -> wake).
 * Idle wander costs no main-thread frames.
 *
 * Identical to the original closure functions with one signature change:
 * `startWander` now takes `wake`, `turn`, `turnUp` as parameters, because
 * the original read them from the createPlanetFaces closure.
 */

import { lookAngles, lookRotate, wanderAt } from "./math";

/* a settled face's wander on the compositor: the same curve sampled
   every 100 ms for twenty seconds (linear steps stay within a fiftieth
   of a degree of it), delayed by the look's own easing, from this
   frame; the frame starts the next stretch when one ends */
export const WANDER_SPAN = 20_000;
export const WANDER_STEP = 100;
export const WANDER_LAG = 80;

export interface WanderFace {
  /** the face's transform box (the element that carries the rotate) */
  box: HTMLElement;
  /** per-face random seed for wanderAt */
  seed: number;
  /** the compositor animation, when one is running */
  wanderAnim: Animation | null;
  /** last look x (from wanderAt when the compositor took over) */
  gx: number;
  /** last look y (from wanderAt when the compositor took over) */
  gy: number;
  /** last rotate string written, to skip identical writes */
  rotateWritten: string;
}

export type WakeCallback = () => void;

export const startWander = (
  face: WanderFace,
  now: number,
  wake: WakeCallback,
  turn: number,
  turnUp: number
): void => {
  const keyframes: Keyframe[] = [];
  for (let ms = 0; ms <= WANDER_SPAN; ms += WANDER_STEP) {
    const [gx, gy] = wanderAt(face.seed, now + ms - WANDER_LAG);
    const [yaw, pitch] = lookAngles(gx, gy, 1, turn, turnUp);
    keyframes.push({
      offset: ms / WANDER_SPAN,
      rotate: lookRotate(yaw, pitch),
    });
  }
  const anim = face.box.animate(keyframes, {
    duration: WANDER_SPAN,
    fill: "forwards",
  });
  anim.startTime = now;
  anim.onfinish = wake;
  face.wanderAnim = anim;
};

export const stopWander = (face: WanderFace, now: number, dt: number): void => {
  face.wanderAnim?.cancel();
  face.wanderAnim = null;
  // the look carries on from where the wander had it a frame ago, as
  // this frame eases it one more step
  const [gx, gy] = wanderAt(face.seed, now - WANDER_LAG - dt);
  face.gx = gx;
  face.gy = gy;
  face.rotateWritten = "";
};
