import { clamp01 } from "./math";

export const blinkMs = 150;
export const blinkHold = 6000;
export const BLINK = Array.from(
  { length: 21 },
  (_, i) => 1 - 0.94 * Math.sin((Math.PI * i) / 20)
);

export interface BlinkEye {
  blink: Animation | null;
  lid: HTMLElement;
}

export interface BlinkFace {
  blinkAt: number;

  e: number;
  eyes: BlinkEye[];

  lids: [number, number];
}

export const blinkLids = (face: BlinkFace): void => {
  for (const [i, eye] of face.eyes.entries()) {
    const v = clamp01((face.e - 0.5) / 0.35) * face.lids[i];
    eye.blink?.cancel();
    const keyframes = BLINK.map((k, j) => ({
      offset: (j * blinkMs) / 20 / blinkHold,
      transform: `scaleY(${(v * k).toFixed(3)})`,
    }));
    keyframes.push({ offset: 1, transform: `scaleY(${v.toFixed(3)})` });
    eye.blink = eye.lid.animate(keyframes, { duration: blinkHold });
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
      return true;
    }
    return Number(ct) < blinkMs;
  });

export const dropBlinks = (face: BlinkFace): void => {
  for (const eye of face.eyes) {
    eye.blink?.cancel();
    eye.blink = null;
  }
};
