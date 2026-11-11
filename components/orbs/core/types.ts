/**
 * Public types for the Orbs engine.
 *
 * Extracted to make the engine's contract explicit. Imported by
 * engine.ts (Phase 4b) and useful for tests, tooling, and downstream
 * consumers. Does not change runtime behavior.
 */

export type ExpressionName = "happy" | "straight" | "thinking";
export type MouthShape = "smile" | "frown" | "flat" | "hmm";
export type BodyKind = "ball" | "shape";
export type MarkPlacement = "nose" | "eyes" | "smile" | "hide";
export type EyeShape = "pill" | "dot";

export interface FaceSettings {
  blink: boolean;
  body: BodyKind;
  expression: ExpressionName;
  expressMs: number;
  eye: number;
  eyeMark: number;
  eyeShape: EyeShape;
  eyeTall: number;
  eyeX: number;
  eyeY: number;
  inMs: number;
  mark: MarkPlacement;
  maxSpan: number;
  minSpan: number;
  mouthR: number;
  mouthY: number;
  noseY: number;
  outMs: number;
  reduceMotion: boolean;
  shapeClose: number;
  shapeMix: number;
  shapeRound: number;
  shapeSize: number;
  shapeSoft: number;
  shapes: Record<string, string> | null;
  turn: number;
  turnUp: number;
  wander: boolean;
}

export interface Expression {
  lids: [number, number];
  mouth: MouthShape;
  tilt: number;
}

export interface SpherePoint {
  lat: number;
  lon: number;
}

export interface Letter extends SpherePoint {
  a: number;
  el: HTMLElement;
  glyph: HTMLElement | null;
  roll: number;
  scale: number;
}

export interface ShapePoint {
  cx: number;
  cy: number;
  dx: number;
  dy: number;
}

export interface ShapeSeries {
  im: Float64Array;
  n: number;
  re: Float64Array;
  waves: number;
}

export interface Eye {
  bar: HTMLElement;
  blink: Animation | null;
  capA: HTMLElement;
  capB: HTMLElement;
  el: HTMLElement;
  lid: HTMLElement;
  markEl: HTMLElement | null;
  pupil: HTMLElement;
  side: -1 | 1;
}

export interface FaceStand {
  items: (SpherePoint & { roll: number; scale: number })[];
  lids: [number, number];
  tilt: number;
}

export interface Face {
  arc: Letter[];
  blinkAt: number;
  blinkTimer: number;
  blinkWritten: number;
  box: HTMLElement;
  detach?: () => void;
  dirty: boolean;
  dur: number;

  e: number;

  expression: ExpressionName;
  eyes: Eye[];
  far: boolean;

  // Methods attached by createFace
  frame?: (now: number, dt: number) => boolean;
  from: number;
  goal: FaceStand | null;

  gx: number;
  gy: number;
  lids: [number, number];
  marks: boolean;
  nextBlink: number;
  nose: SpherePoint;
  orb: HTMLElement;
  poly: ShapePoint[] | null;
  polyKey: string | null;
  prior: FaceStand | null;

  rect: DOMRect | null;
  rectAt: number;
  rest: boolean;
  ring: HTMLElement;
  rotateWritten: string;
  seed: number;

  series: ShapeSeries[] | null;
  seriesClose: string | null;
  set?: (on: boolean) => void;
  shaped: boolean;
  shapeTask: number;
  start: number;
  tilt: number;
  tiltWritten: string;
  to: number;

  visible: boolean;

  wanderAnim: Animation | null;
  wanderFrom: number | null;

  written: number;
  x: number;
  xStart: number;
  xWritten: number;
}

export interface OrbsOptions {
  settings?: Partial<FaceSettings>;
}

export interface OrbsEngine {
  attach: (orb: HTMLElement, ring: HTMLElement) => Face;
  destroy: () => void;
}
