import {
  easeInOut,
  easeInOutQuad,
  easeOutExpo,
  easeSmoothOut,
} from "./animation";

export interface AnimationKeyframes {
  times?: number[];
  values: number[];
}

export interface AnimationConfig {
  keyframes?: AnimationKeyframes;
  transition: Record<string, unknown>;
}

const NAMED_EASINGS: Record<string, readonly number[]> = {
  easeInOut,
  easeInOutQuad,
  easeOutExpo,
  easeSmoothOut,
};

const MOTION_NATIVE_EASINGS = new Set([
  "linear",
  "circIn",
  "circOut",
  "circInOut",
  "backIn",
  "backOut",
  "backInOut",
  "anticipate",
]);

const DURATION_RE = /^(\d+(?:\.\d+)?)(ms|s)?$/;
const DELAY_RE = /^delay\(([^)]+)\)$/;
const REPEAT_RE = /^repeat\(([^)]+)\)$/;

function warn(message: string): void {
  if (typeof console !== "undefined" && typeof console.warn === "function") {
    console.warn(`[motion-dsl] ${message}`);
  }
}

function toSeconds(raw: string): number | null {
  const m = raw.trim().match(DURATION_RE);
  if (!m) {
    return null;
  }
  const n = Number.parseFloat(m[1]);
  if (Number.isNaN(n)) {
    return null;
  }
  return m[2] === "ms" ? n / 1000 : n;
}

function parseNumbers(raw: string): number[] {
  return raw.split(",").map((s) => Number.parseFloat(s.trim()));
}

function tokenize(input: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of input) {
    if (ch === "(" || ch === "[") {
      depth++;
    }
    if (ch === ")" || ch === "]") {
      depth--;
    }
    if (/\s/.test(ch) && depth === 0) {
      if (cur) {
        out.push(cur);
      }
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur) {
    out.push(cur);
  }
  return out;
}

export function parseAnimation(input?: false | string): AnimationConfig | null {
  if (input === undefined || input === false) {
    return null;
  }
  if (typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const tokens = tokenize(trimmed);
  if (tokens.length === 0) {
    return null;
  }

  const head = tokens[0];
  let config: AnimationConfig;

  if (head.startsWith("spring(")) {
    const args = parseNumbers(head.slice(7, -1));
    if (args.length !== 2 || args.some(Number.isNaN)) {
      warn(`invalid spring: "${head}" - expected spring(stiffness, damping)`);
      return null;
    }
    config = {
      transition: { damping: args[1], stiffness: args[0], type: "spring" },
    };
  } else if (head.startsWith("inertia(")) {
    const args = parseNumbers(head.slice(8, -1));
    if (args.length !== 2 || args.some(Number.isNaN)) {
      warn(
        `invalid inertia: "${head}" - expected inertia(power, timeConstant)`
      );
      return null;
    }
    config = {
      transition: { power: args[0], timeConstant: args[1], type: "inertia" },
    };
  } else if (head.startsWith("cubic-bezier(")) {
    const args = parseNumbers(head.slice(13, -1));
    if (args.length !== 4 || args.some(Number.isNaN)) {
      warn(`invalid cubic-bezier: "${head}" - expected 4 numbers`);
      return null;
    }
    config = {
      transition: {
        ease: args as [number, number, number, number],
        type: "tween",
      },
    };
  } else if (head.startsWith("steps(")) {
    const args = parseNumbers(head.slice(6, -1));
    if (args.length !== 1 || Number.isNaN(args[0])) {
      warn(`invalid steps: "${head}" - expected steps(count)`);
      return null;
    }
    config = { transition: { ease: "linear", type: "tween" } };
  } else if (head.startsWith("keyframes(")) {
    const inner = head.slice(10, -1);
    const arrays = inner.match(/\[[^\]]*\]/g);
    if (!arrays || arrays.length === 0) {
      warn(
        `invalid keyframes: "${head}" - expected keyframes([values], [times]?)`
      );
      return null;
    }
    const values = arrays[0]
      .slice(1, -1)
      .split(",")
      .map((s) => Number.parseFloat(s.trim()));

    if (values.some(Number.isNaN)) {
      warn(`invalid keyframes values: "${arrays[0]}"`);
      return null;
    }
    const times = arrays[1]
      ? arrays[1]
          .slice(1, -1)
          .split(",")
          .map((s) => Number.parseFloat(s.trim()))
      : undefined;
    if (times?.some(Number.isNaN)) {
      warn(`invalid keyframes times: "${arrays[1]}"`);
      return null;
    }
    config = { keyframes: { times, values }, transition: { type: "tween" } };
  } else if (head in NAMED_EASINGS) {
    config = {
      transition: {
        ease: [...NAMED_EASINGS[head]] as [number, number, number, number],
        type: "tween",
      },
    };
  } else if (MOTION_NATIVE_EASINGS.has(head)) {
    config = { transition: { ease: head, type: "tween" } };
  } else {
    warn(`unknown easing or syntax: "${head}"`);
    return null;
  }

  const isTween = config.transition.type === "tween";

  for (const token of tokens.slice(1)) {
    const dur = toSeconds(token);
    if (dur !== null) {
      if (isTween) {
        (config.transition as { duration?: number }).duration = dur;
      }
      continue;
    }
    const delayMatch = token.match(DELAY_RE);
    if (delayMatch) {
      const d = toSeconds(delayMatch[1]);
      if (d === null) {
        warn(`invalid delay: "${token}"`);
        continue;
      }
      (config.transition as { delay?: number }).delay = d;
      continue;
    }
    const repeatMatch = token.match(REPEAT_RE);
    if (repeatMatch) {
      const v = repeatMatch[1].trim();
      if (v === "infinite") {
        (config.transition as { repeat?: number }).repeat =
          Number.POSITIVE_INFINITY;
      } else {
        const n = Number.parseInt(v, 10);
        if (Number.isNaN(n) || n < 0) {
          warn(`invalid repeat: "${token}"`);
          continue;
        }
        (config.transition as { repeat?: number }).repeat = n;
      }
      continue;
    }
    warn(`unexpected token: "${token}"`);
  }

  return config;
}
