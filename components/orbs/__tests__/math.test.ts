import { describe, expect, it } from "vitest";

import {
  clamp,
  clamp01,
  easeBack,
  easeInOut,
  EXPRESSIONS,
  lookAngles,
  lookRotate,
  wanderAt,
} from "@/components/orbs/core/math";

/**
 * Snapshot tests for the orbs math layer.
 *
 * These functions drive the visual appearance of every face:
 * lookRotate determines head orientation, wanderAt the idle wander,
 * EXPRESSIONS the mouth/eyes. A change here means a visual regression
 * — the snapshots make that intentional and reviewable.
 */

describe("orbs/math", () => {
  describe("clamping helpers", () => {
    it("clamp keeps values within bounds", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-1, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("clamp01 restricts to [0,1]", () => {
      expect(clamp01(0.5)).toBe(0.5);
      expect(clamp01(-0.1)).toBe(0);
      expect(clamp01(1.1)).toBe(1);
    });
  });

  describe("easing functions", () => {
    it("easeInOut is symmetric at 0, 0.5, 1", () => {
      expect(easeInOut(0)).toBe(0);
      expect(easeInOut(0.5)).toBe(0.5);
      expect(easeInOut(1)).toBe(1);
    });

    it("easeBack anchors at 0 and 1", () => {
      expect(easeBack(0)).toBeCloseTo(0, 6);
      expect(easeBack(1)).toBeCloseTo(1, 6);
    });

    it("easeBack overshoots past 1 around p=0.75", () => {
      expect(easeBack(0.75)).toBeGreaterThan(1);
    });
  });

  describe("look rotation", () => {
    it("returns identity for zero yaw and pitch", () => {
      expect(lookRotate(0, 0)).toBe("1 0 0 0deg");
    });

    it("snapshots for known yaw/pitch pairs", () => {
      expect(lookRotate(24, 0)).toMatchSnapshot("yaw=24 pitch=0");
      expect(lookRotate(0, 4)).toMatchSnapshot("yaw=0 pitch=4");
      expect(lookRotate(-12, -3)).toMatchSnapshot("yaw=-12 pitch=-3");
      expect(lookRotate(24, 4)).toMatchSnapshot("yaw=24 pitch=4");
      expect(lookRotate(-24, -4)).toMatchSnapshot("yaw=-24 pitch=-4");
    });
  });

  describe("look angle scaling", () => {
    it("scales gx by turn, gy by turn (positive direction)", () => {
      const [yaw, pitch] = lookAngles(1, 1, 1, 24, 4);
      expect(yaw).toBe(24);
      expect(pitch).toBe(24);
    });

    it("clamps upward pitch (gy negative) to -turnUp", () => {
      const [, pitch] = lookAngles(1, -1, 1, 24, 4);
      expect(pitch).toBe(-4);
    });

    it("scales by morph progress", () => {
      const [yaw, pitch] = lookAngles(1, 1, 0.5, 24, 4);
      expect(yaw).toBe(12);
      expect(pitch).toBe(12);
    });
  });

  describe("wander path", () => {
    it("is deterministic for identical seed and time", () => {
      const a = wanderAt(1.5, 5000);
      const b = wanderAt(1.5, 5000);
      expect(a).toStrictEqual(b);
    });

    it("snapshots for known seed and time", () => {
      expect(wanderAt(0, 0)).toMatchSnapshot("seed=0 time=0");
      expect(wanderAt(1.5, 5000)).toMatchSnapshot("seed=1.5 time=5000");
      expect(wanderAt(42, 12_345)).toMatchSnapshot("seed=42 time=12345");
    });
  });

  describe("expression registry", () => {
    it("defines exactly the three documented expressions", () => {
      expect(Object.keys(EXPRESSIONS).toSorted()).toStrictEqual([
        "happy",
        "straight",
        "thinking",
      ]);
    });

    it("happy has open eyes, smile mouth, no tilt", () => {
      expect(EXPRESSIONS.happy.mouth).toBe("smile");
      expect(EXPRESSIONS.happy.lids).toStrictEqual([1, 1]);
      expect(EXPRESSIONS.happy.tilt).toBe(0);
    });

    it("thinking has half-closed left eye and tilt", () => {
      expect(EXPRESSIONS.thinking.mouth).toBe("hmm");
      expect(EXPRESSIONS.thinking.lids).toStrictEqual([0.5, 1]);
      expect(EXPRESSIONS.thinking.tilt).toBe(-6);
    });
  });
});
