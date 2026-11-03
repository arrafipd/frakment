/* eslint-disable
   eslint/no-plusplus,
   unicorn/no-array-for-each,
   unicorn/no-array-sort,
   unicorn/prefer-number-coercion,
   unicorn/no-array-fill-with-reference-type,
   eslint/prefer-destructuring
*/
/**
 * Shape-morphing pipeline extracted from components/orbs.tsx.
 *
 * Traces an SVG mark's silhouette onto a small canvas, floods the
 * outside, traces the outline, resamples it to even steps, and keeps it
 * as a Fourier series so a softer copy is the same series with fewer of
 * its waves. Baked shapes (from LANDING_SHAPES) skip the tracing and
 * come in as step-encoded point lists.
 *
 * Identical to the original closure functions. No arithmetic has changed.
 */

// enough points that a ray's sides are curves, not facets, and enough
// waves kept that the softening has died away before the series ends
// (cut off early, a series ripples along every edge)
const SHAPE_N = 400;
const SHAPE_PX = 384;
const SHAPE_FIT = 0.56;
const SHAPE_WAVES = 160;

// the skin's box is this many planets wide, so a tip has room past the
// disc (the stylesheet's inset on .lp-orb-ball must agree)
export const SHAPE_BOX = 1.5;

export interface ShapeSeries {
  im: Float64Array;
  n: number;
  re: Float64Array;
  waves: number;
}

export interface ShapePoint {
  cx: number;
  cy: number;
  dx: number;
  dy: number;
}

export type ShapeLoop = number[][];
export type ShapeLoops = ShapeLoop[];
export type ShapePoly = ShapePoint[];

/* the mark's silhouette, for a ball that takes its shape. The mark is
   drawn filled on a small canvas and stroked wide, which bridges any
   gap narrower than the closing radius; the outside is flooded from
   the border, so what is left is the mark with its holes filled; its
   edge is traced, the stroke's width taken back off, and the outline
   resampled to even steps and kept as a Fourier series, so a softer
   copy is the same series with fewer of its waves. A mark in pieces (a
   wordmark) keeps each piece as a series of its own */

const floodOutside = (mask: Uint8Array): void => {
  const W = SHAPE_PX;
  const seen = new Uint8Array(mask.length);
  const stack: number[] = [];
  const push = (i: number) => {
    if (!(seen[i] || mask[i])) {
      seen[i] = 1;
      stack.push(i);
    }
  };
  for (let x = 0; x < W; x++) {
    push(x);
    push((W - 1) * W + x);
  }
  for (let y = 0; y < W; y++) {
    push(y * W);
    push(y * W + W - 1);
  }
  while (stack.length) {
    const i = stack.pop() as number;
    const x = i % W;
    if (x > 0) {
      push(i - 1);
    }
    if (x < W - 1) {
      push(i + 1);
    }
    if (i >= W) {
      push(i - W);
    }
    if (i < mask.length - W) {
      push(i + W);
    }
  }
  for (let i = 0; i < mask.length; i++) {
    mask[i] = seen[i] ? 0 : 1;
  }
};

/* the edges between a filled pixel and an empty one, chained into
   loops with the filled side always to the same hand; the vertices
   are the pixel corners */
const outline = (mask: Uint8Array): ShapeLoops => {
  const W = SHAPE_PX;
  const V = W + 1;
  const at = (x: number, y: number) =>
    x < 0 || y < 0 || x >= W || y >= W ? 0 : mask[y * W + x];
  const next = new Map<number, number[]>();
  const add = (a: number, b: number) => {
    const list = next.get(a);
    if (list) {
      list.push(b);
    } else {
      next.set(a, [b]);
    }
  };
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      if (!mask[y * W + x]) {
        continue;
      }
      if (!at(x, y - 1)) {
        add(y * V + x, y * V + x + 1);
      }
      if (!at(x + 1, y)) {
        add(y * V + x + 1, (y + 1) * V + x + 1);
      }
      if (!at(x, y + 1)) {
        add((y + 1) * V + x + 1, (y + 1) * V + x);
      }
      if (!at(x - 1, y)) {
        add((y + 1) * V + x, y * V + x);
      }
    }
  }
  const loops: ShapeLoops = [];
  next.forEach((_, start) => {
    let list = next.get(start);
    if (!(list && list.length)) {
      return;
    }
    const loop: ShapeLoop = [];
    let v = start;
    while (true) {
      list = next.get(v);
      if (!(list && list.length)) {
        break;
      }
      loop.push([v % V, Math.floor(v / V)]);
      v = list.pop() as number;
      if (v === start) {
        break;
      }
    }
    if (loop.length > 2) {
      loops.push(loop);
    }
  });
  return loops;
};

const area = (pts: ShapeLoop): number => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    a += x0 * y1 - x1 * y0;
  }
  return a / 2;
};

/* the loops worth keeping: the biggest and any other at least a
   twentieth of it (a wordmark is more than one piece), biggest first */
const loopsOf = (loops: ShapeLoops): ShapeLoops | null => {
  const sized = loops
    .map((loop) => ({ a: Math.abs(area(loop)), loop }))
    .filter((l) => l.a > 0)
    .sort((p, q) => q.a - p.a);
  if (!sized.length) {
    return null;
  }
  return sized.filter((l) => l.a >= sized[0].a / 20).map((l) => l.loop);
};

const perimeter = (loop: ShapeLoop): number => {
  let total = 0;
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i];
    const b = loop[(i + 1) % loop.length];
    total += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  return total;
};

const resample = (loop: ShapeLoop, n: number): ShapeLoop => {
  const along: number[] = [0];
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i];
    const b = loop[(i + 1) % loop.length];
    along.push(along[i] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = along[loop.length];
  const out: ShapeLoop = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const s = (total * k) / n;
    while (j + 1 < loop.length && along[j + 1] <= s) {
      j++;
    }
    const a = loop[j];
    const b = loop[(j + 1) % loop.length];
    const seg = along[j + 1] - along[j];
    const t = seg > 0 ? (s - along[j]) / seg : 0;
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
};

const series = (pts: ShapeLoop): ShapeSeries => {
  const n = pts.length;
  const waves = Math.min(SHAPE_WAVES, Math.floor(n / 2) - 1);
  const re = new Float64Array(2 * waves + 1);
  const im = new Float64Array(2 * waves + 1);
  for (let k = -waves; k <= waves; k++) {
    let sr = 0;
    let si = 0;
    for (let j = 0; j < n; j++) {
      const a = (-2 * Math.PI * k * j) / n;
      const [x, y] = pts[j];
      sr += x * Math.cos(a) - y * Math.sin(a);
      si += x * Math.sin(a) + y * Math.cos(a);
    }
    re[k + waves] = sr / n;
    im[k + waves] = si / n;
  }
  return { im, n, re, waves };
};

export const traceMark = (
  svg: Element,
  closeK: number,
  roundK: number
): ShapeSeries[] | null => {
  const view = (svg.getAttribute("viewBox") || "")
    .trim()
    .split(/[\s,]+/u)
    .map(Number);
  const [vx, vy, vw, vh] =
    view.length === 4 && view.every((n) => Number.isFinite(n))
      ? view
      : [0, 0, 24, 24];
  const canvas = document.createElement("canvas");
  canvas.width = SHAPE_PX;
  canvas.height = SHAPE_PX;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return null;
  }
  const f = (SHAPE_PX * SHAPE_FIT) / Math.max(vw, vh);
  const r = Math.max(0, closeK) * SHAPE_PX * SHAPE_FIT;
  const round = Math.max(0, roundK) * SHAPE_PX * SHAPE_FIT;
  ctx.setTransform(
    f,
    0,
    0,
    f,
    SHAPE_PX / 2 - (vx + vw / 2) * f,
    SHAPE_PX / 2 - (vy + vh / 2) * f
  );
  ctx.fillStyle = "#000";
  ctx.strokeStyle = "#000";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  let drew = false;
  svg.querySelectorAll("path").forEach((el) => {
    const d = el.getAttribute("d");
    if (!d || el.closest("defs, clipPath, mask")) {
      return;
    }
    const path = new Path2D(d);
    const own = (name: string, fallback: string): string =>
      el.getAttribute(name) ?? svg.getAttribute(name) ?? fallback;
    const fill = own("fill", "#000");
    const stroke = own("stroke", "none");
    const width = Number.parseFloat(own("stroke-width", "1")) || 1;
    ctx.save();
    const move = /translate\(\s*([-\d.]+)[\s,]+([-\d.]+)/u.exec(
      el.getAttribute("transform") || ""
    );
    if (move) {
      ctx.translate(Number(move[1]), Number(move[2]));
    }
    if (fill !== "none") {
      ctx.fill(
        path,
        own("fill-rule", "nonzero") === "evenodd" ? "evenodd" : "nonzero"
      );
      drew = true;
    }
    // the stroke is in the mark's units: the closing radius over the
    // scale (a width of nothing is not a width canvas takes)
    const wide = (stroke === "none" ? 0 : width) + (2 * r) / f;
    if (wide > 0) {
      ctx.lineWidth = wide;
      ctx.stroke(path);
      drew = true;
    }
    ctx.restore();
  });
  if (!drew) {
    return null;
  }
  const read = () => {
    const { data } = ctx.getImageData(0, 0, SHAPE_PX, SHAPE_PX);
    const mask = new Uint8Array(SHAPE_PX * SHAPE_PX);
    for (let i = 0; i < mask.length; i++) {
      mask[i] = data[i * 4 + 3] > 127 ? 1 : 0;
    }
    return mask;
  };
  // the outlines drawn again, grown by a stroke round them or shrunk
  // by one taken out of them, and traced again
  const redraw = (loops: ShapeLoops, grow: number): ShapeLoops | null => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, SHAPE_PX, SHAPE_PX);
    const closed = new Path2D();
    loops.forEach((loop) => {
      loop.forEach(([x, y], i) =>
        i ? closed.lineTo(x, y) : closed.moveTo(x, y)
      );
      closed.closePath();
    });
    ctx.fill(closed);
    if (grow) {
      ctx.globalCompositeOperation =
        grow > 0 ? "source-over" : "destination-out";
      ctx.lineWidth = 2 * Math.abs(grow);
      ctx.stroke(closed);
      ctx.globalCompositeOperation = "source-over";
    }
    return loopsOf(outline(read()));
  };
  const mask = read();
  floodOutside(mask);
  let loops = loopsOf(outline(mask));
  if (loops && r > 0) {
    // the stroke's width off again: what it bridged stays bridged
    loops = redraw(loops, -r);
  }
  if (loops && round > 0) {
    // the tips rounded: anything thinner than the radius goes, and
    // what is left grows back by as much
    loops = redraw(loops, -round);
    if (loops) {
      loops = redraw(loops, round);
    }
  }
  if (!loops) {
    return null;
  }
  // the points shared out by length, each piece getting a few at least
  const lengths = loops.map(perimeter);
  const total = lengths.reduce((sum, l) => sum + l, 0);
  return loops.map((loop, i) =>
    series(
      resample(loop, Math.max(24, Math.round((SHAPE_N * lengths[i]) / total)))
    )
  );
};

/* the shape at a softness: each piece's series summed with every wave
   past the soft one weighted down, all of them centred on their area
   and scaled to the disc's (times size), in radii, and joined into one
   outline: each further piece spliced into the first at the closest
   pair of points, there and back along one line, which adds no area.
   For the morph, each point also keeps where it stands on the disc and
   how far it goes from there */
export const shapeAt = (
  pieces: ShapeSeries[],
  soft: number,
  size: number
): ShapePoly | null => {
  const loops: ShapeLoop[] = pieces.map((ser) => {
    const pts: ShapeLoop = [];
    for (let j = 0; j < ser.n; j++) {
      let x = 0;
      let y = 0;
      for (let k = -ser.waves; k <= ser.waves; k++) {
        const w = Math.exp(-((k / Math.max(soft, 0.5)) ** 2));
        if (w < 1e-4) {
          continue;
        }
        const a = (2 * Math.PI * k * j) / ser.n;
        const cr = ser.re[k + ser.waves];
        const ci = ser.im[k + ser.waves];
        x += w * (cr * Math.cos(a) - ci * Math.sin(a));
        y += w * (cr * Math.sin(a) + ci * Math.cos(a));
      }
      pts.push([x, y]);
    }
    return pts;
  });
  let total = 0;
  let cx = 0;
  let cy = 0;
  for (const pts of loops) {
    total += area(pts);
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      const c = x0 * y1 - x1 * y0;
      cx += (x0 + x1) * c;
      cy += (y0 + y1) * c;
    }
  }
  if (!total) {
    return null;
  }
  cx /= 6 * total;
  cy /= 6 * total;
  // the disc's area times size, held inside the skin's box with the
  // morph's overshoot (easeBack peaks near 1.045) and a little to spare,
  // so no ray is ever cut flat at the box's edge
  let reach = 0;
  for (const pts of loops) {
    for (const [x, y] of pts) {
      reach = Math.max(reach, Math.abs(x - cx), Math.abs(y - cy));
    }
  }
  const s = Math.min(
    size * Math.sqrt(Math.PI / Math.abs(total)),
    (SHAPE_BOX * 0.98) / 1.05 / (reach || 1)
  );
  const scaled = loops.map((pts) =>
    pts.map(([x, y]) => [(x - cx) * s, (y - cy) * s])
  );
  let seq = scaled[0];
  scaled.slice(1).forEach((loop) => {
    let best = Number.POSITIVE_INFINITY;
    let bi = 0;
    let bj = 0;
    seq.forEach((p, i) => {
      loop.forEach((q, j) => {
        const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
        if (d < best) {
          best = d;
          bi = i;
          bj = j;
        }
      });
    });
    seq = [
      ...seq.slice(0, bi + 1),
      ...loop.slice(bj),
      ...loop.slice(0, bj),
      loop[bj],
      seq[bi],
      ...seq.slice(bi + 1),
    ];
  });
  return seq.map(([x, y]) => {
    const r = Math.hypot(x, y) || 1;
    return { cx: x / r, cy: y / r, dx: x - x / r, dy: y - y / r };
  });
};

export const clipAt = (poly: ShapePoly, m: number): string => {
  const k = 50 / SHAPE_BOX;
  let s = "";
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    s += `${i ? "," : ""}${(50 + k * (p.cx + p.dx * m)).toFixed(2)}% ${(50 + k * (p.cy + p.dy * m)).toFixed(2)}%`;
  }
  return `polygon(${s})`;
};

/* a baked shape: points in thousandths of the radius, the first one
   whole and each after it as a step from the one before (x,y dx,dy
   ...), which keeps the string short; read into the morph's points */
export const fromBaked = (text: string): ShapePoly | null => {
  let x = 0;
  let y = 0;
  const out: ShapePoly = [];
  text
    .trim()
    .split(/\s+/u)
    .forEach((pair) => {
      const [a, b] = pair.split(",").map(Number);
      x += a;
      y += b;
      const px = x / 1000;
      const py = y / 1000;
      const r = Math.hypot(px, py) || 1;
      out.push({ cx: px / r, cy: py / r, dx: px - px / r, dy: py - py / r });
    });
  return out.length > 2 ? out : null;
};
