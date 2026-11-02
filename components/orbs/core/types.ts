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
  mark: MarkPlacement;
  eyeShape: EyeShape;
  eye: number;
  eyeTall: number;
  eyeMark: number;
  eyeX: number;
  eyeY: number;
  mouthR: number;
  mouthY: number;
  minSpan: number;
  maxSpan: number;
  noseY: number;
  expression: ExpressionName;
  expressMs: number;
  turn: number;
  turnUp: number;
  blink: boolean;
  wander: boolean;
  inMs: number;
  outMs: number;
  body: BodyKind;
  shapes: Record<string, string> | null;
  shapeClose: number;
  shapeRound: number;
  shapeSoft: number;
  shapeSize: number;
  shapeMix: number;
  reduceMotion: boolean;
}

export interface Expression {
  mouth: MouthShape;
  lids: [number, number];
  tilt: number;
}

export interface SpherePoint {
  lon: number;
  lat: number;
}

export interface Letter extends SpherePoint {
  el: HTMLElement;
  glyph: HTMLElement | null;
  a: number;
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
  re: Float64Array;
  im: Float64Array;
  n: number;
  waves: number;
}

export interface Eye {
  side: -1 | 1;
  el: HTMLElement;
  lid: HTMLElement;
  pupil: HTMLElement;
  capA: HTMLElement;
  bar: HTMLElement;
  capB: HTMLElement;
  markEl: HTMLElement | null;
  blink: Animation | null;
}

export interface FaceStand {
  items: (SpherePoint & { roll: number; scale: number })[];
  lids: [number, number];
  tilt: number;
}

export interface Face {
  orb: HTMLElement;
  ring: HTMLElement;
  box: HTMLElement;
  eyes: Eye[];

  rect: DOMRect | null;
  rectAt: number;

  arc: Letter[];
  nose: SpherePoint;
  marks: boolean;

  series: ShapeSeries[] | null;
  seriesClose: string | null;
  poly: ShapePoint[] | null;
  polyKey: string | null;
  shapeTask: number;
  shaped: boolean;

  expression: ExpressionName;
  goal: FaceStand | null;
  prior: FaceStand | null;
  x: number;
  xStart: number;
  lids: [number, number];
  tilt: number;

  e: number;
  to: number;
  from: number;
  start: number;
  dur: number;
  rest: boolean;

  written: number;
  blinkWritten: number;
  xWritten: number;
  dirty: boolean;

  gx: number;
  gy: number;
  seed: number;
  nextBlink: number;
  blinkAt: number;
  blinkTimer: number;

  visible: boolean;
  far: boolean;

  wanderAnim: Animation | null;
  wanderFrom: number | null;
  rotateWritten: string;
  tiltWritten: string;

  // Methods attached by createFace
  frame?: (now: number, dt: number) => boolean;
  set?: (on: boolean) => void;
  detach?: () => void;
}

export interface OrbsOptions {
  settings?: Partial<FaceSettings>;
}

export interface OrbsEngine {
  attach: (orb: HTMLElement, ring: HTMLElement) => Face;
  destroy: () => void;
}
