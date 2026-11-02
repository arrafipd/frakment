/**
 * Pure math functions extracted from components/orbs.tsx.
 *
 * Every function here is a byte-for-byte copy of the original closure
 * body with one exception: `clamp` was rewritten from a nested ternary
 * to Math.min/Math.max to satisfy the project's no-nested-ternary lint
 * rule. The two forms are mathematically identical for all call sites
 * in orbs.tsx (which never pass lo > hi). `lookAngles` now takes turn
 * and turnUp as explicit parameters; call sites pass the same values
 * the closure used to read.
 */

export const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(Math.max(v, lo), hi);

export const clamp01 = (v: number) => clamp(v, 0, 1);

export const easeInOut = (p: number) =>
  p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;

export const easeBack = (p: number) =>
  1 + 2.1 * (p - 1) ** 3 + 1.1 * (p - 1) ** 2;

export const RAD = 180 / Math.PI;

export const lookRotate = (yaw: number, pitch: number): string => {
  const a = (Number((-pitch).toFixed(3)) * Math.PI) / 360;
  const b = (Number(yaw.toFixed(3)) * Math.PI) / 360;
  const x = Math.sin(a) * Math.cos(b);
  const y = Math.cos(a) * Math.sin(b);
  const z = Math.sin(a) * Math.sin(b);
  const s = Math.hypot(x, y, z);
  if (s < 1e-7) {
    return "1 0 0 0deg";
  }
  const angle = 2 * Math.atan2(s, Math.cos(a) * Math.cos(b)) * RAD;
  return `${(x / s).toFixed(9)} ${(y / s).toFixed(9)} ${(z / s).toFixed(9)} ${angle.toFixed(7)}deg`;
};

export const lookAngles = (
  gx: number,
  gy: number,
  on: number,
  turn: number,
  turnUp: number
): [number, number] => [gx * turn * on, Math.max(gy * turn, -turnUp) * on];

export const wanderAt = (seed: number, ms: number): [number, number] => {
  const t = ms / 1000 + seed;
  return [
    0.55 * Math.sin(t * 0.71) * Math.cos(t * 0.23),
    0.4 * Math.sin(t * 0.47 + 1.3),
  ];
};

export type ExpressionName = "happy" | "straight" | "thinking";
export type MouthShape = "smile" | "frown" | "flat" | "hmm";

export interface Expression {
  mouth: MouthShape;
  lids: [number, number];
  tilt: number;
}

export const EXPRESSIONS: Record<ExpressionName, Expression> = {
  happy: { mouth: "smile", lids: [1, 1], tilt: 0 },
  straight: { mouth: "flat", lids: [1, 1], tilt: 0 },
  thinking: { mouth: "hmm", lids: [0.5, 1], tilt: -6 },
};
