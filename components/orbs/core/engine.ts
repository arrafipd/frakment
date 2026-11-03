/* eslint-disable complexity, no-plusplus, no-use-before-define, prefer-destructuring, @typescript-eslint/ban-ts-comment, unicorn/consistent-function-scoping, unicorn/no-array-fill-with-reference-type, unicorn/no-array-for-each, unicorn/no-array-sort, unicorn/prefer-add-event-listener, unicorn/prefer-math-min-max, unicorn/prefer-number-coercion, unicorn/prefer-query-selector */
// @ts-nocheck
/**
 * Engine — the runtime that wires the six landing-page planets.
 *
 * Phase 3c+4 of incremental refactor. This file is a byte-for-byte copy
 * of `createPlanetFaces` from components/orbs.tsx. All helper functions
 * (wanderAt, lookRotate, lookAngles, floodOutside, outline, traceMark,
 * shapeAt, clipAt, fromBaked, copyMark, onSphere, place, blinkLids,
 * blinking, dropBlinks, startWander, stopWander, createFace) are still
 * nested inside `createPlanetFaces`, exactly as in the original. This is
 * intentional: the goal of Phase 3c+4 is to move the engine into its own
 * file with ZERO behavior change.
 *
 * The only additions are:
 *   1. `// @ts-nocheck` — same pragma the original uses (orbs.tsx line 2)
 *   2. imports for the helpers that lived OUTSIDE createPlanetFaces
 *      (clamp, clamp01, easeInOut, easeBack, idle, cancelIdle)
 *   3. `export` on the createPlanetFaces const
 *
 * Duplication with core/math.ts, core/shape.ts, core/sphere.ts,
 * core/blink.ts, core/wander.ts is expected: those modules already
 * contain the same logic, and Phase 4b (post-cutover, optional) will
 * remove the duplication by switching the body to import from them.
 *
 * No production code is touched. orbs.tsx is unchanged. Not imported
 * anywhere yet.
 */

import { cancelIdle, idle } from "./idle";
import { clamp, clamp01, easeBack, easeInOut } from "./math";

export const createPlanetFaces = (options = {}) => {
  const DEFAULTS = {
    blink: true,
    // the ball itself: 'ball' keeps the disc; 'shape' lets the mark's
    // silhouette take it over while the face is on (the mark drawn
    // filled, its holes filled and its gaps bridged, then softened: a
    // bump or a tip for each of the mark's, none of its detail).
    // shapeClose is the notch it bridges and shapeRound the tip it
    // rounds, each a radius as a share of the mark's size (more than a
    // little rounding erodes a thin ray away); shapeSoft how many waves
    // round the outline survive after that (60: smooth sides, round
    // tips); shapeSize scales it (1 keeps the disc's area); shapeMix
    // how far from the disc it goes. A planet overrides the first four
    // with data-shape-close, -round, -soft and -size, takes its shape
    // from a template lp-shape-<icon> when the page has one, and keeps
    // the disc with data-shape="false"; so does a host with no
    // .lp-orb-skin
    body: "ball",
    // the face's expression: 'happy' (the smile), 'straight' (the name
    // on a line) or 'thinking' (the mouth pulled to one side, one eye
    // narrowed, the head tilted); a change tweens over expressMs
    expression: "happy",
    expressMs: 340,
    eye: 0.18,
    eyeMark: 0.34,
    // the pupils: 'pill' (upright capsule) or 'dot'; their width, how
    // tall a pill is (times its width), and, when the eyes are the
    // mark, the mark's size; then their distance from the middle and
    // their height, each as a share of the ball's radius (up is negative)
    eyeShape: "pill",
    eyeTall: 1.7,
    eyeX: 0.3,
    eyeY: -0.2,
    inMs: 700,
    // what the mark does: 'nose', 'eyes', 'smile' (it leads the name
    // round the arc) or 'hide'. A planet whose mark makes a poor eye
    // (a wordmark) opts out with data-mark-eyes="false" and keeps pills
    mark: "nose",
    maxSpan: 150,
    // a short name is spaced out to this arc, a long one scaled down
    // to that (degrees)
    minSpan: 75,
    // the smile: the circle the glyphs stand on and its lowest point,
    // as shares of the radius
    mouthR: 0.5,
    mouthY: 0.55,
    // where the nose lands, as a share of the radius
    noseY: 0.1,
    outMs: 520,
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    shapeClose: 0.02,
    shapeMix: 1,
    shapeRound: 0.015,
    shapeSize: 1,
    shapeSoft: 60,
    // the shapes baked ahead of time, by the planet's icon (the lab's
    // exportShapes() writes them): when given, nothing is traced on the
    // page, and a planet missing from them keeps its disc
    shapes: null,
    // how far the head turns towards the pointer (degrees, at most);
    // past about 25 the far end of a long smile reaches the rim, and a
    // look up is held short so the eyes stay clear of the bubble
    turn: 24,
    turnUp: 4,
    // without a pointer the head looks about on its own
    wander: true,
  };
  const settings = { ...DEFAULTS, ...options.settings };
  /* an expression: how the mouth lies, how open each eye is, and the
     head's tilt (degrees, a roll). The mouth is the name: 'smile' puts
     it on the smile's circle, 'frown' on the same circle turned over,
     'flat' on a line, 'hmm' on a line that rises to one side, shifted
     that way */
  const EXPRESSIONS = {
    happy: { lids: [1, 1], mouth: "smile", tilt: 0 },
    straight: { lids: [1, 1], mouth: "flat", tilt: 0 },
    thinking: { lids: [0.5, 1], mouth: "hmm", tilt: -6 },
  };
  const faces = new Set();
  let pointer = null;
  let frame = 0;
  let last = null;
  const recent = [];
  let copies = 0;

  const RAD = 180 / Math.PI;
  /* the wander: where a face with no pointer looks at a time, as the
     look's x and y */
  const wanderAt = (seed, ms) => {
    const t = ms / 1000 + seed;
    return [
      0.55 * Math.sin(t * 0.71) * Math.cos(t * 0.23),
      0.4 * Math.sin(t * 0.47 + 1.3),
    ];
  };
  /* the head's turn, rotateX(-pitch) rotateY(yaw), as one axis and
     angle for the rotate property (the product of the two half-angle
     quaternions); the transform keeps the tilt, which rotate composes
     outside of, so the matrix is the old transform's exactly */
  const lookRotate = (yaw, pitch) => {
    // the old transform wrote its angles to three places, so these start
    // from the same numbers
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
  const lookAngles = (gx, gy, on) => [
    gx * settings.turn * on,
    Math.max(gy * settings.turn, -settings.turnUp) * on,
  ];
  /* a settled face's wander on the compositor: the same curve sampled
     every 100 ms for twenty seconds (linear steps stay within a fiftieth
     of a degree of it), delayed by the look's own easing, from this
     frame; the frame starts the next stretch when one ends */
  const WANDER_SPAN = 20_000;
  const WANDER_STEP = 100;
  const WANDER_LAG = 80;
  function wake() {
    if (!(frame || document.hidden)) {
      last = null;
      frame = requestAnimationFrame(tick);
    }
  }
  const startWander = (face, now) => {
    const keyframes = [];
    for (let ms = 0; ms <= WANDER_SPAN; ms += WANDER_STEP) {
      const [gx, gy] = wanderAt(face.seed, now + ms - WANDER_LAG);
      const [yaw, pitch] = lookAngles(gx, gy, 1);
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
  /* a pill's blink on the compositor: its lid closes and opens on the
     frame's curve (1 - 0.94 sin(pi p) over 150 ms, sampled every 7.5 ms)
     from where it stands, then holds open until the next blink replaces
     it (an animation that ends costs main-thread frames of its own). The
     frame drops the hold whenever it writes the eyes, and finishes a
     blink itself when the lids are moving (an expression's tween) */
  const BLINK_MS = 150;
  const BLINK_HOLD = 6000;
  const BLINK = Array.from(
    { length: 21 },
    (_, i) => 1 - 0.94 * Math.sin((Math.PI * i) / 20)
  );
  const blinkLids = (face) => {
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
  const blinking = (face) =>
    face.eyes.some((eye) => eye.blink && eye.blink.currentTime < BLINK_MS);
  const dropBlinks = (face) => {
    face.eyes.forEach((eye) => {
      eye.blink?.cancel();
      eye.blink = null;
    });
  };
  const stopWander = (face, now, dt) => {
    face.wanderAnim.cancel();
    face.wanderAnim = null;
    // the look carries on from where the wander had it a frame ago, as
    // this frame eases it one more step
    const [gx, gy] = wanderAt(face.seed, now - WANDER_LAG - dt);
    face.gx = gx;
    face.gy = gy;
    face.rotateWritten = "";
  };

  /* the frame: runs while a face moves, sleeps otherwise; a pointer
     move, a blink's timer, a change of settings or a talk wakes it */
  function awake() {
    for (const face of faces) {
      if (!face.rest && face.visible) {
        return true;
      }
    }
    return false;
  }
  function tick(now) {
    frame = 0;
    // a frame after a sleep steps as the frames before it did when the
    // look was moving all along, on the compositor
    const woke = last === null;
    let dt = 16;
    if (last !== null) {
      dt = Math.min(now - last, 100);
      recent.push(dt);
      if (recent.length > 8) {
        recent.shift();
      }
    } else if (recent.length && [...faces].some((face) => face.wanderAnim)) {
      // the shortest of the last few, so one long frame does not count
      dt = Math.min(...recent);
    }
    last = now;
    // the planets' places come from the pointer and scroll events and a
    // read after each frame, when layout is clean; a frame reads one
    // itself (a forced style pass, before any write) only when it has
    // none, or for a face out of view, whose frames are rare
    let follow = false;
    faces.forEach((face) => {
      if (face.orb.isConnected) {
        if (
          (face.far || !face.visible) &&
          face.to === 1 &&
          (face.e !== face.to || now - face.start < face.dur)
        ) {
          // the flags are from the observer's last notice: check them
          // before a morph is skipped, or shown whole on its way back in
          const r = face.orb.getBoundingClientRect();
          face.far =
            r.bottom < -innerHeight / 2 ||
            r.top > innerHeight * 1.5 ||
            r.right < -innerWidth / 2 ||
            r.left > innerWidth * 1.5;
          if (!face.far && face.e === 1 && now - face.start < face.dur) {
            // it formed at once while far, but is back before its morph
            // would have ended: the clock takes it from there
            face.e = face.from;
          }
        }
        if (pointer && !face.rest) {
          // a frame after a sleep reads an old place too: the planet may
          // have moved while nothing ran
          if (
            !face.rect ||
            (!face.visible && now - face.rectAt > 400) ||
            (woke && now - face.rectAt > 100)
          ) {
            face.rect = face.orb.getBoundingClientRect();
            face.rectAt = now;
          }
          follow ||= face.visible;
        }
      } else {
        // its planet left the page
        faces.delete(face);
        byOrb.delete(face.orb);
        inView.unobserve(face.orb);
      }
    });
    if (follow && !refreshing) {
      refreshing = true;
      after.port2.postMessage(0);
    }
    let busy = false;
    faces.forEach((face) => {
      if (face.frame(now, dt)) {
        busy = true;
      }
    });
    if (busy && !document.hidden) {
      frame = requestAnimationFrame(tick);
    }
  }
  const nudge = () => {
    if (awake()) {
      wake();
    }
  };
  /* the talking planets' places, read in the input and scroll events:
     they run before the frame's animation callbacks, while style is
     usually still clean, so the read seldom costs a style pass */
  const measure = () => {
    const at = performance.now();
    faces.forEach((face) => {
      if (!face.rest && face.visible && face.orb.isConnected) {
        face.rect = face.orb.getBoundingClientRect();
        face.rectAt = at;
      }
    });
  };
  // the places read again once a frame is done and layout is clean; a
  // planet that moved wakes the frame, so its head follows it
  let refreshing = false;
  const after = new MessageChannel();
  after.port1.onmessage = () => {
    refreshing = false;
    const before = new Map([...faces].map((face) => [face, face.rect]));
    measure();
    for (const face of faces) {
      const was = before.get(face);
      const { rect } = face;
      if (
        was &&
        rect &&
        was !== rect &&
        (Math.abs(was.left - rect.left) > 0.5 ||
          Math.abs(was.top - rect.top) > 0.5 ||
          Math.abs(was.width - rect.width) > 0.5)
      ) {
        wake();
        break;
      }
    }
  };
  // a finger lifts without leaving, so it never sets the look
  const onMove = (event) => {
    if (event.pointerType === "touch") {
      return;
    }
    pointer = { x: event.clientX, y: event.clientY };
    if (awake()) {
      measure();
      wake();
    }
  };
  // a scroll keeps the places fresh; the heads re-aim at the next frame
  // that runs anyway, as they always did
  const onScroll = () => {
    if (pointer && awake()) {
      measure();
    }
    // a face that formed at once far out of view may be scrolled back
    // in before its morph would have ended: the frame checks, before it
    // paints
    const at = performance.now();
    for (const face of faces) {
      if (
        !face.visible &&
        face.to === 1 &&
        face.e === 1 &&
        at - face.start < face.dur
      ) {
        wake();
        break;
      }
    }
  };
  const onLeave = () => {
    pointer = null;
    nudge();
  };
  const onUp = (event) => {
    if (event.pointerType !== "mouse") {
      pointer = null;
      nudge();
    }
  };
  /* a face out of view does not form, look about, blink or tween to a
     new expression: nobody would see it, and each would cost frames */
  const byOrb = new Map();
  const inView = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const face = byOrb.get(entry.target);
      if (!face) {
        return;
      }
      face.visible = entry.isIntersecting;
      // far enough out that a frame cannot bring it in before the next
      // notice: half a viewport beyond any edge
      const root = entry.rootBounds;
      const r = entry.boundingClientRect;
      face.far =
        !face.visible &&
        Boolean(root) &&
        (r.bottom < root.top - root.height / 2 ||
          r.top > root.bottom + root.height / 2 ||
          r.right < root.left - root.width / 2 ||
          r.left > root.right + root.width / 2);
      if (face.rest) {
        return;
      }
      window.clearTimeout(face.blinkTimer);
      if (face.visible) {
        // its place as the observer saw it, fresh and free
        face.rect = entry.boundingClientRect;
        face.rectAt = performance.now();
        if (
          face.to === 1 &&
          face.e === 1 &&
          performance.now() - face.start < face.dur
        ) {
          // it formed at once out of view, but its morph would still be
          // running: the clock takes it from there
          face.e = face.from;
          wake();
        }
        if (face.to === 1) {
          // the next blink a little while after it comes into view, and
          // that blink wakes the frame, as a blink always did
          face.nextBlink = performance.now() + 900 + Math.random() * 1600;
          face.blinkTimer = window.setTimeout(
            wake,
            face.nextBlink - performance.now()
          );
        }
      } else if (!pointer) {
        // its wander goes to the compositor at once
        wake();
      }
    });
  });
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("scroll", onScroll, { capture: true, passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  window.addEventListener("pointercancel", onUp, { passive: true });
  document.documentElement.addEventListener("mouseleave", onLeave);
  document.addEventListener("visibilitychange", nudge);

  /* the mark's silhouette, for a ball that takes its shape. The mark is
     drawn filled on a small canvas and stroked wide, which bridges any
     gap narrower than the closing radius; the outside is flooded from
     the border, so what is left is the mark with its holes filled; its
     edge is traced, the stroke's width taken back off, and the outline
     resampled to even steps and kept as a Fourier series, so a softer
     copy is the same series with fewer of its waves. A mark in pieces (a
     wordmark) keeps each piece as a series of its own */
  // enough points that a ray's sides are curves, not facets, and enough
  // waves kept that the softening has died away before the series ends
  // (cut off early, a series ripples along every edge)
  const SHAPE_N = 400;
  const SHAPE_PX = 384;
  const SHAPE_FIT = 0.56;
  const SHAPE_WAVES = 160;
  // the skin's box is this many planets wide, so a tip has room past
  // the disc (the stylesheet's inset on .lp-orb-ball must agree)
  const SHAPE_BOX = 1.5;
  const floodOutside = (mask) => {
    const W = SHAPE_PX;
    const seen = new Uint8Array(mask.length);
    const stack = [];
    const push = (i) => {
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
      const i = stack.pop();
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
  const outline = (mask) => {
    const W = SHAPE_PX;
    const V = W + 1;
    const at = (x, y) =>
      x < 0 || y < 0 || x >= W || y >= W ? 0 : mask[y * W + x];
    const next = new Map();
    const add = (a, b) => {
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
    const loops = [];
    next.forEach((_, start) => {
      let list = next.get(start);
      if (!(list && list.length)) {
        return;
      }
      const loop = [];
      let v = start;
      while (true) {
        list = next.get(v);
        if (!(list && list.length)) {
          break;
        }
        loop.push([v % V, Math.floor(v / V)]);
        v = list.pop();
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
  const area = (pts) => {
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
  const loopsOf = (loops) => {
    const sized = loops
      .map((loop) => ({ a: Math.abs(area(loop)), loop }))
      .filter((l) => l.a > 0)
      .sort((p, q) => q.a - p.a);
    if (!sized.length) {
      return null;
    }
    return sized.filter((l) => l.a >= sized[0].a / 20).map((l) => l.loop);
  };
  const perimeter = (loop) => {
    let total = 0;
    for (let i = 0; i < loop.length; i++) {
      const a = loop[i];
      const b = loop[(i + 1) % loop.length];
      total += Math.hypot(b[0] - a[0], b[1] - a[1]);
    }
    return total;
  };
  const resample = (loop, n) => {
    const along = [0];
    for (let i = 0; i < loop.length; i++) {
      const a = loop[i];
      const b = loop[(i + 1) % loop.length];
      along.push(along[i] + Math.hypot(b[0] - a[0], b[1] - a[1]));
    }
    const total = along[loop.length];
    const out = [];
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
  const series = (pts) => {
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
  const traceMark = (svg, closeK, roundK) => {
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
      const own = (name, fallback) =>
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
    const redraw = (loops, grow) => {
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
  const shapeAt = (pieces, soft, size) => {
    const loops = pieces.map((ser) => {
      const pts = [];
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
  const clipAt = (poly, m) => {
    const k = 50 / SHAPE_BOX;
    let s = "";
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i];
      s += `${i ? "," : ""}${(50 + k * (p.cx + p.dx * m)).toFixed(2)}% ${(50 + k * (p.cy + p.dy * m)).toFixed(2)}%`;
    }
    return `polygon(${s})`;
  };

  /* a baked shape: points in thousandths of the radius, the first one
     whole and each after it as a step from the one before ("x,y dx,dy
     ..."), which keeps the string short; read into the morph's points */
  const fromBaked = (text) => {
    let x = 0;
    let y = 0;
    const out = [];
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
  /* a copy of the mark for an eye, its gradient ids made its own */
  const copyMark = (svg) => {
    const nextCopies = copies + 1;
    copies = nextCopies;
    const suffix = `-e${nextCopies}`;
    const holder = document.createElement("span");
    holder.className = "lp-eye-mark";
    holder.innerHTML = svg.outerHTML
      .replaceAll(/id="([^"]+)"/gu, `id="$1${suffix}"`)
      .replaceAll(/url\(#([^)]+)\)/gu, `url(#$1${suffix})`);
    return holder;
  };
  /* a feature's place on the sphere: longitude and latitude (radians)
     from where it should appear on the face when the head is straight,
     x to the right and y down, as shares of the radius */
  const onSphere = (x, y) => {
    const lat = Math.asin(clamp(y, -0.96, 0.96));
    const lon = Math.asin(clamp(x / Math.cos(lat), -0.96, 0.96));
    return { lat, lon };
  };
  const place = (lon, lat, roll = 0) =>
    `rotateY(${(lon * RAD).toFixed(3)}deg) rotateX(${(-lat * RAD).toFixed(3)}deg) translateZ(calc(var(--s) / 2))${roll ? ` rotateZ(${(roll * RAD).toFixed(3)}deg)` : ""}`;

  const createFace = (orb, ring) => {
    const items = [...ring.querySelectorAll(".lp-orb-item")].map((item) => ({
      a:
        (Number.parseFloat(item.style.getPropertyValue("--a")) * Math.PI) / 180,
      el: item,
      glyph: item.firstElementChild,
      lat: 0,
      lon: 0,
      roll: 0,
      scale: 1,
    }));
    const mark = items[0];
    const letters = items.slice(1);
    const markSvg = mark?.glyph.querySelector("svg");
    // the ball's skin, when the host has one: the layer the shape clips;
    // and the shape's source, a template of its own or the mark
    const skin = orb.querySelector(".lp-orb-skin");
    const shapeSvg =
      document.getElementById(`lp-shape-${orb.dataset.icon}`)?.content
        ?.firstElementChild ?? markSvg;
    // a planet's own values for the shape, over the settings
    const shapeSetting = (key) => {
      const own = Number.parseFloat(orb.dataset[key] ?? "");
      return Number.isFinite(own) ? own : settings[key];
    };
    // the face box: one box in the ring holding the glyphs (moved in)
    // and the eyes; the look turns it. Each eye is a zero-size box on
    // the sphere, a lid (the blink), a pupil holding a capsule of two
    // round caps and a bar, and a copy of the mark for when the eyes
    // are the mark
    const box = document.createElement("div");
    box.className = "lp-face";
    items.forEach((item) => box.append(item.el));
    const eyes = [-1, 1].map((side) => {
      const eye = document.createElement("div");
      eye.className = "lp-eye";
      const lid = document.createElement("div");
      lid.className = "lp-eye-lid";
      const pupil = document.createElement("div");
      pupil.className = "lp-eye-pupil";
      const capA = document.createElement("i");
      capA.className = "lp-eye-cap";
      const bar = document.createElement("i");
      bar.className = "lp-eye-bar";
      const capB = document.createElement("i");
      capB.className = "lp-eye-cap";
      pupil.append(capA, bar, capB);
      let markEl = null;
      if (markSvg) {
        markEl = copyMark(markSvg);
        pupil.append(markEl);
      }
      lid.append(pupil);
      eye.append(lid);
      box.append(eye);
      return { bar, capA, capB, el: eye, lid, markEl, pupil, side };
    });
    ring.append(box);

    const face = {
      arc: letters,
      blinkAt: -1e9,
      blinkTimer: 0,
      blinkWritten: 1,
      box,
      dirty: true,
      dur: 0,
      e: 0,
      expression: settings.expression,
      eyes,
      far: false,
      from: 0,
      // the expression's targets, the ones before, and the tween between
      goal: null,
      // the look, smoothed, and the head's own wander
      gx: 0,
      gy: 0,
      lids: [1, 1],
      marks: false,
      nextBlink: 0,
      nose: { lat: 0, lon: 0 },
      orb,
      poly: null,
      polyKey: null,
      prior: null,
      rect: null,
      rectAt: 0,
      rest: true,
      ring,
      rotateWritten: "",
      seed: Math.random() * 1000,
      // the mark's outline as a series, and the shape the ball takes, each
      // with the settings it was made for, and the idle task making them
      series: null,
      seriesClose: null,
      shaped: false,
      shapeTask: 0,
      start: 0,
      tilt: 0,
      tiltWritten: "",
      to: 0,
      visible: true,
      // the compositor's wander, and what the frame last wrote
      wanderAnim: null,
      wanderFrom: null,
      // what the last frame wrote, to skip the writes nothing changed
      written: -1,
      x: 1,
      xStart: 0,
      xWritten: -1,
    };

    /* the face's geometry: each glyph's arc position on the equator
       (its angle, which is its arc length over the radius) becomes its
       position on the smile's circle, the word centred at the bottom,
       and that becomes a place on the sphere; a short word is spaced
       out to the least arc, a long one scaled down to the most. The
       eyes and the nose get their places on the sphere too, and the
       eyes their shape, all in terms of the host's --s */
    const layout = () => {
      face.dirty = true;
      face.marks =
        settings.mark === "eyes" &&
        Boolean(markSvg) &&
        orb.dataset.markEyes !== "false";
      box.style.setProperty(
        "--lp-eye-d",
        `calc(var(--s) * ${(settings.eye / 2).toFixed(4)})`
      );
      box.style.setProperty(
        "--lp-eye-mark",
        `calc(var(--s) * ${(settings.eyeMark / 2).toFixed(4)})`
      );
      box.classList.toggle("is-marks", face.marks);
      const tall = settings.eyeShape === "pill" ? settings.eyeTall : 1;
      // the caps sit half the bar apart: the bar is (tall - 1) pupil
      // widths, a pupil width is eye * --s / 2
      const half = (settings.eye * (tall - 1)) / 4;
      eyes.forEach((eye) => {
        const { lon, lat } = onSphere(eye.side * settings.eyeX, settings.eyeY);
        eye.el.style.transform = place(lon, lat);
        eye.capA.style.transform = `translateY(calc(var(--s) * ${(-half).toFixed(4)}))`;
        eye.capB.style.transform = `translateY(calc(var(--s) * ${half.toFixed(4)}))`;
        eye.bar.style.transform = `scaleY(${(tall - 1).toFixed(3)})`;
      });
      face.nose = onSphere(0, settings.noseY);
      face.arc =
        settings.mark === "smile" && mark ? [mark, ...letters] : letters;
      if (!wantsShape()) {
        face.poly = null;
        face.polyKey = null;
        unshape();
      } else if (face.polyKey !== shapeKey() && settings.shapes) {
        prepareShape();
      } else if (face.polyKey !== shapeKey() && !face.shapeTask) {
        // the shape it has stays until the new one is ready
        face.shapeTask = idle(prepareShape);
      }
      face.goal = aim(face.expression);
      face.prior = face.goal;
      face.x = 1;
    };

    /* the ball's shape: traced from the mark (or its own template) and
       softened, made in an idle moment after attach or a change of
       settings, or at once when a talk starts before that */
    // back to the plain disc: no clip, no shaped class
    const unshape = () => {
      if (skin) {
        skin.style.clipPath = "";
        skin.parentElement.classList.remove("is-shaped");
      }
      face.shaped = false;
    };
    const baked = () => settings.shapes?.[orb.dataset.icon];
    const wantsShape = () =>
      settings.body === "shape" &&
      Boolean(skin) &&
      orb.dataset.shape !== "false" &&
      (settings.shapes ? Boolean(baked()) : Boolean(shapeSvg));
    const shapeKey = () =>
      settings.shapes
        ? `baked:${baked()?.length}`
        : ["shapeClose", "shapeRound", "shapeSoft", "shapeSize"]
            .map(shapeSetting)
            .join(":");
    const prepareShape = () => {
      face.shapeTask = 0;
      if (!wantsShape() || face.polyKey === shapeKey()) {
        return;
      }
      if (settings.shapes) {
        // baked: read, nothing traced
        face.poly = fromBaked(baked());
        face.polyKey = shapeKey();
        face.dirty = true;
        if (!face.rest) {
          wake();
        }
        return;
      }
      const traced = `${shapeSetting("shapeClose")}:${shapeSetting("shapeRound")}`;
      if (!face.series || face.seriesClose !== traced) {
        face.series = traceMark(
          shapeSvg,
          shapeSetting("shapeClose"),
          shapeSetting("shapeRound")
        );
        face.seriesClose = traced;
      }
      face.poly = face.series
        ? shapeAt(
            face.series,
            shapeSetting("shapeSoft"),
            shapeSetting("shapeSize")
          )
        : null;
      face.polyKey = shapeKey();
      // a face already on takes the new shape at its next frame
      face.dirty = true;
      if (!face.rest) {
        wake();
      }
    };

    /* where the mouth's glyphs, the lids and the tilt go for an
       expression. Each glyph's arc position on the equator (its angle,
       which is its arc length over the radius) becomes its position
       along the mouth, the word centred; on the smile a short word is
       spaced out to the least arc and a long one scaled down to the
       most, on a line a long word is scaled to fit the face */
    const aim = (name) => {
      const expr = EXPRESSIONS[name] ?? EXPRESSIONS.happy;
      const { arc } = face;
      const r = settings.mouthR;
      const yc = settings.mouthY - r;
      const out = { items: [], lids: expr.lids, tilt: expr.tilt };
      if (!arc.length) {
        return out;
      }
      const pos = arc.map((l) => l.a);
      const first = pos[0];
      const final = pos.at(-1);
      const centre = (first + final) / 2;
      const step = arc.length > 1 ? (final - first) / (arc.length - 1) : 0;
      const extent = final - first + step;
      let offsets = pos.map((p) => p - centre);
      let scale = 1;
      if (expr.mouth === "smile" || expr.mouth === "frown") {
        const span = extent / r;
        const min = (settings.minSpan * Math.PI) / 180;
        const max = (settings.maxSpan * Math.PI) / 180;
        if (span < min && extent > 0) {
          offsets = offsets.map((q) => (q * (min * r)) / extent);
        } else if (span > max) {
          scale = max / span;
          offsets = offsets.map((q) => q * scale);
        }
        // a frown is the smile's own circle turned over: its centre sits
        // above the mouth instead of below, so the word keeps its middle
        // where it was and bows its ends down. The glyphs follow the
        // tangent either way, so the roll turns over with it
        const down = expr.mouth === "frown";
        const mid = down ? settings.mouthY + r : yc;
        out.items = offsets.map((q) => {
          const psi = q / r;
          const y = down ? mid - r * Math.cos(psi) : mid + r * Math.cos(psi);
          return {
            ...onSphere(r * Math.sin(psi), y),
            roll: down ? psi : -psi,
            scale,
          };
        });
        return out;
      }
      // a line across the lower face, held short of the rim (shorter
      // still when it sits to one side)
      const width = expr.mouth === "hmm" ? 0.88 : 0.98;
      if (extent > width) {
        scale = width / extent;
        offsets = offsets.map((q) => q * scale);
      }
      const flatY = settings.mouthY - 0.1;
      if (expr.mouth === "flat") {
        out.items = offsets.map((q) => ({
          ...onSphere(q, flatY),
          roll: 0,
          scale,
        }));
        return out;
      }
      // 'hmm': the line rises to the right and sits a little that way
      const slope = -0.24;
      const shift = 0.07;
      const roll = Math.atan(slope);
      out.items = offsets.map((q) => {
        const x = q * Math.cos(roll) + shift;
        return {
          ...onSphere(x, flatY + 0.02 + slope * (x - shift)),
          roll,
          scale,
        };
      });
      return out;
    };

    /* another expression, tweened from wherever the face is now */
    /* the targets as they stand now, between the prior and the goal */
    const current = () => {
      const k = easeInOut(face.x);
      const mix = (a, b) => a + (b - a) * k;
      return {
        items: face.goal.items.map((g, i) => {
          const o = face.prior.items[i] ?? g;
          return {
            lat: mix(o.lat, g.lat),
            lon: mix(o.lon, g.lon),
            roll: mix(o.roll, g.roll),
            scale: mix(o.scale, g.scale),
          };
        }),
        lids: [
          mix(face.prior.lids[0], face.goal.lids[0]),
          mix(face.prior.lids[1], face.goal.lids[1]),
        ],
        tilt: mix(face.prior.tilt, face.goal.tilt),
      };
    };

    const restore = () => {
      items.forEach(({ el, glyph }) => {
        el.style.transform = "";
        glyph.style.transform = "";
        glyph.style.opacity = "";
      });
      face.wanderAnim?.cancel();
      face.wanderAnim = null;
      face.wanderFrom = null;
      dropBlinks(face);
      box.style.transform = "";
      box.style.rotate = "";
      unshape();
      face.rotateWritten = "";
      face.tiltWritten = "";
      box.classList.remove("is-on");
      window.clearTimeout(face.blinkTimer);
      face.rest = true;
      // nothing the last talk wrote stands now: the next talk's first
      // frame writes it all again (a talk that forms at once, under
      // reduced motion, would otherwise match the memo and write nothing)
      face.written = -1;
      face.xWritten = -1;
      face.blinkWritten = -1;
    };

    face.set = (on) => {
      const to = on ? 1 : 0;
      if (face.to === to) {
        return;
      }
      if (
        face.to === 1 &&
        face.e === 1 &&
        performance.now() - face.start < face.dur
      ) {
        // it formed at once out of view: it turns back from where its
        // morph would be
        face.e =
          face.from +
          (1 - face.from) *
            easeBack(clamp01((performance.now() - face.start) / face.dur));
      }
      if (on && wantsShape() && face.polyKey !== shapeKey()) {
        // a talk before the idle moment came: the shape is made now
        cancelIdle(face.shapeTask);
        prepareShape();
      }
      face.to = to;
      face.from = face.e;
      face.start = performance.now();
      face.dur = on ? settings.inMs : settings.outMs;
      window.clearTimeout(face.blinkTimer);
      if (on) {
        box.classList.add("is-on");
        face.rest = false;
        face.nextBlink = face.start + 1800 + Math.random() * 1600;
      }
      wake();
    };
    face.detach = () => {
      cancelIdle(face.shapeTask);
      face.shapeTask = 0;
      restore();
      items.forEach((item) => ring.append(item.el));
      box.remove();
      faces.delete(face);
      byOrb.delete(orb);
      inView.unobserve(orb);
    };

    face.frame = (now, dt) => {
      // the morph; a face forming far out of view goes straight to where
      // it is going (one unwinding always unwinds: it may be on its way
      // back into view)
      if (face.e !== face.to) {
        if (
          settings.reduceMotion ||
          face.dur <= 0 ||
          (face.far && face.to === 1)
        ) {
          face.e = face.to;
        } else {
          const p = clamp01((now - face.start) / face.dur);
          const k = face.to > face.from ? easeBack(p) : easeInOut(p);
          face.e = p >= 1 ? face.to : face.from + (face.to - face.from) * k;
        }
      }
      const { e } = face;
      if (e <= 0 && face.to === 0) {
        if (!face.rest) {
          restore();
        }
        return false;
      }
      const on = clamp01(e);
      // the expression's tween
      if (face.x < 1) {
        const p = clamp01((now - face.xStart) / settings.expressMs);
        face.x = p >= 1 ? 1 : p;
      }
      if (face.x < 1 || face.dirty) {
        const stand = current();
        stand.items.forEach((t, i) => {
          const l = face.arc[i];
          l.lon = t.lon;
          l.lat = t.lat;
          l.roll = t.roll;
          l.scale = t.scale;
        });
        face.lids = stand.lids;
        face.tilt = stand.tilt;
      }

      // where to look: the pointer, from the ball's centre, saturating a
      // few radii out; or, with no pointer, a slow wander; eased so a
      // jump of the pointer is a glance, not a snap. A settled face with
      // no pointer wanders on the compositor instead (startWander)
      const wandering = !pointer && settings.wander && !settings.reduceMotion;
      // the compositor takes over once the look has eased onto the wander
      // (half a second, six of its time constants), so a pointer leaving
      // still glides back into it
      if (!wandering) {
        face.wanderFrom = null;
      } else if (face.wanderFrom === null) {
        face.wanderFrom = now;
      }
      // out of view it hands over at once (nobody sees a glide) and keeps
      // wandering there, which costs the main thread nothing
      const settled = wandering && face.to === 1 && e === 1;
      const free = settled && (!face.visible || now - face.wanderFrom >= 500);
      if (
        face.wanderAnim &&
        (!settled || face.wanderAnim.playState === "finished")
      ) {
        stopWander(face, now, dt);
      }
      if (free && !face.wanderAnim) {
        startWander(face, now);
      }
      let looking = false;
      if (!face.wanderAnim) {
        let tx = 0;
        let ty = 0;
        if (pointer && face.rect) {
          const R = face.rect.width / 2;
          const dx = pointer.x - (face.rect.left + R);
          const dy = pointer.y - (face.rect.top + R);
          const dist = Math.hypot(dx, dy);
          if (dist > 0.5) {
            const k = dist / (dist + 2.5 * R);
            tx = (dx / dist) * k;
            ty = (dy / dist) * k;
          }
        } else if (settings.wander && !settings.reduceMotion) {
          [tx, ty] = wanderAt(face.seed, now);
        }
        // out of view the look snaps to its target on frames that run
        // anyway, and keeps nothing awake
        looking =
          face.visible &&
          (Math.abs(tx - face.gx) > 0.0005 || Math.abs(ty - face.gy) > 0.0005);
        if (looking) {
          const ease = 1 - Math.exp(-dt / 80);
          face.gx += (tx - face.gx) * ease;
          face.gy += (ty - face.gy) * ease;
        } else {
          face.gx = tx;
          face.gy = ty;
        }
        // the head turns towards the look: yaw to the side, pitch up or
        // down (a positive rotateX lifts the front, so the pitch is
        // signed the other way; a look up is held short), both held back
        // while the face is still forming
        const [yaw, pitch] = lookAngles(face.gx, face.gy, on);
        const rotate = lookRotate(yaw, pitch);
        if (rotate !== face.rotateWritten) {
          box.style.rotate = rotate;
          face.rotateWritten = rotate;
        }
      }
      const tilt = `rotateZ(${(face.tilt * on).toFixed(3)}deg)`;
      if (tilt !== face.tiltWritten) {
        box.style.transform = tilt;
        face.tiltWritten = tilt;
      }

      // a blink now and then, once the face is there: pills on the
      // compositor (blinkLids), a mark-eye by the frame
      let blink = 1;
      let midBlink = false;
      if (
        settings.blink &&
        !settings.reduceMotion &&
        face.visible &&
        face.to === 1 &&
        e >= 0.95
      ) {
        if (now >= face.nextBlink) {
          face.blinkAt = now;
          face.nextBlink = now + 2600 + Math.random() * 3200;
          if (!face.marks && face.x >= 1) {
            blinkLids(face);
          }
        }
        const bp = (now - face.blinkAt) / BLINK_MS;
        if ((face.marks || !blinking(face)) && bp >= 0 && bp < 1) {
          blink = 1 - 0.94 * Math.sin(Math.PI * bp);
          midBlink = true;
        }
      } else if (blinking(face)) {
        // a blink stops the moment it may not run, as it always did
        dropBlinks(face);
        face.blinkWritten = -1;
      }

      // the features move with the morph and the blink only; a frame
      // that changed neither writes nothing here
      const shapeSame =
        e === face.written && face.x === face.xWritten && !face.dirty;
      const eyesSame = shapeSame && blink === face.blinkWritten;
      face.written = e;
      face.blinkWritten = blink;
      face.xWritten = face.x;
      face.dirty = false;
      if (!shapeSame) {
        // the ball: the disc gives way to the mark's shape as the face
        // forms, on the same curve, and back
        if (face.poly) {
          // shaped only while it is off the disc: the stylesheet gives a
          // shaped ball its filter, the plain disc its own shadows
          if (e > 0 !== face.shaped) {
            skin.parentElement.classList.toggle("is-shaped", e > 0);
            face.shaped = e > 0;
          }
          skin.style.clipPath =
            e > 0 ? clipAt(face.poly, settings.shapeMix * e) : "";
        }
        // the glyphs slide over the sphere from the equator to the arc,
        // rolling into the curve on the way
        face.arc.forEach((l) => {
          const lon = l.a + (l.lon - l.a) * e;
          l.el.style.transform = place(lon, l.lat * e, l.roll * e);
          l.glyph.style.opacity = "";
          l.glyph.style.transform =
            l.scale === 1
              ? ""
              : `translate(-50%, -50%) scale(${(1 + (l.scale - 1) * on).toFixed(3)})`;
        });
        // the mark: down the sphere as a nose, or gone by the time the
        // eyes open (as the smile's lead it went round with the glyphs)
        if (mark && settings.mark !== "smile") {
          if (settings.mark === "nose") {
            mark.el.style.transform = place(
              mark.a * (1 - e),
              face.nose.lat * e
            );
            mark.glyph.style.transform = `translate(-50%, -50%) scale(${(1 - 0.2 * on).toFixed(3)})`;
            mark.glyph.style.opacity = "";
          } else {
            // a fade, at its own size (Cameron: no scaling on the way out)
            const k = clamp01(1 - e / 0.02);
            mark.el.style.transform = "";
            mark.glyph.style.opacity = k.toFixed(3);
            mark.glyph.style.transform = "";
          }
        }
      }
      if (!eyesSame) {
        // the eyes open once the smile is mostly there: a pill as a lid
        // (scaled from a line), a mark by a clip from its middle, so it
        // is never squashed; they stay where they are and look straight
        // ahead, the head does the turning
        const open = clamp01((e - 0.5) / 0.35);
        eyes.forEach((eye, i) => {
          const v = open * blink * face.lids[i];
          if (face.marks && eye.markEl) {
            if (eye.blink) {
              // a pill's blink or hold would scale the mark
              eye.blink.cancel();
              eye.blink = null;
            }
            eye.lid.style.transform = "";
            eye.pupil.style.transform = "";
            eye.markEl.style.clipPath = `inset(${(50 * (1 - v)).toFixed(1)}% 0)`;
          } else {
            if (eye.markEl) {
              eye.markEl.style.clipPath = "";
            }
            if (eye.blink && eye.blink.currentTime >= BLINK_MS) {
              // the blink is over: its hold would mask this write
              eye.blink.cancel();
              eye.blink = null;
            }
            eye.lid.style.transform = `scaleY(${v.toFixed(3)})`;
            eye.pupil.style.transform = `scale(${(0.5 + 0.5 * open).toFixed(3)})`;
          }
        });
      }

      // still moving? Otherwise the frame sleeps: a pointer move or a
      // change wakes it, and the next blink by its timer
      const moving =
        e !== face.to ||
        looking ||
        (wandering && face.visible && !face.wanderAnim) ||
        midBlink ||
        face.x < 1;
      if (
        !moving &&
        settings.blink &&
        !settings.reduceMotion &&
        face.visible &&
        face.to === 1
      ) {
        window.clearTimeout(face.blinkTimer);
        face.blinkTimer = window.setTimeout(
          wake,
          Math.max(0, face.nextBlink - now)
        );
      }
      return moving;
    };

    layout();
    return face;
  };

  return {
    attach: (orb, ring) => {
      const face = createFace(orb, ring);
      faces.add(face);
      byOrb.set(orb, face);
      inView.observe(orb);
      return face;
    },
    destroy: () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", nudge);
      [...faces].forEach((face) => face.detach());
      inView.disconnect();
      after.port1.close();
      cancelAnimationFrame(frame);
      frame = 0;
    },
  };
};
