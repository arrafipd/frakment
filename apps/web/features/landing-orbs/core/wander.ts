import { lookAngles, lookRotate, wanderAt } from "./math";

export const wanderSpan = 20_000;
export const wanderStep = 100;
export const wanderLag = 80;

export interface WanderFace {
  box: HTMLElement;

  gx: number;

  gy: number;

  rotateWritten: string;

  seed: number;

  wanderAnim: Animation | null;
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
  for (let ms = 0; ms <= wanderSpan; ms += wanderStep) {
    const [gx, gy] = wanderAt(face.seed, now + ms - wanderLag);
    const [yaw, pitch] = lookAngles(gx, gy, 1, turn, turnUp);
    keyframes.push({
      offset: ms / wanderSpan,
      rotate: lookRotate(yaw, pitch),
    });
  }
  const anim = face.box.animate(keyframes, {
    duration: wanderSpan,
    fill: "forwards",
  });
  anim.startTime = now;
  anim.onfinish = wake;
  face.wanderAnim = anim;
};

export const stopWander = (face: WanderFace, now: number, dt: number): void => {
  face.wanderAnim?.cancel();
  face.wanderAnim = null;

  const [gx, gy] = wanderAt(face.seed, now - wanderLag - dt);
  face.gx = gx;
  face.gy = gy;
  face.rotateWritten = "";
};
