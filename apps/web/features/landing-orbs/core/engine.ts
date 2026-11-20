// @ts-nocheck
import { cancelIdle, idle } from "./idle";
import { clamp, clamp01, easeBack, easeInOut } from "./math";

export const createPlanetFaces = (options = {}) => {
  const DEFAULTS = {
    blink: true,

    body: "ball",

    expression: "happy",
    expressMs: 340,
    eye: 0.18,
    eyeMark: 0.34,

    eyeShape: "pill",
    eyeTall: 1.7,
    eyeX: 0.3,
    eyeY: -0.2,
    inMs: 700,

    mark: "nose",
    maxSpan: 150,

    minSpan: 75,

    mouthR: 0.5,
    mouthY: 0.55,

    noseY: 0.1,
    outMs: 520,
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    shapeClose: 0.02,
    shapeMix: 1,
    shapeRound: 0.015,
    shapeSize: 1,
    shapeSoft: 60,

    shapes: null,

    turn: 24,
    turnUp: 4,

    wander: true,
  };
  const settings = { ...DEFAULTS, ...options.settings };

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

  const wanderAt = (seed, ms) => {
    const t = ms / 1000 + seed;
    return [
      0.55 * Math.sin(t * 0.71) * Math.cos(t * 0.23),
      0.4 * Math.sin(t * 0.47 + 1.3),
    ];
  };

  const lookRotate = (yaw, pitch) => {
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

  const wanderSpan = 20_000;
  const wanderStep = 100;
  const wanderLag = 80;
  function wake() {
    if (!(frame || document.hidden)) {
      last = null;
      frame = requestAnimationFrame(tick);
    }
  }
  const startWander = (face, now) => {
    const keyframes = [];
    for (let ms = 0; ms <= wanderSpan; ms += wanderStep) {
      const [gx, gy] = wanderAt(face.seed, now + ms - wanderLag);
      const [yaw, pitch] = lookAngles(gx, gy, 1);
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

  const blinkMs = 150;
  const blinkHold = 6000;
  const BLINK = Array.from(
    { length: 21 },
    (_, i) => 1 - 0.94 * Math.sin((Math.PI * i) / 20)
  );
  const blinkLids = (face) => {
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
  const blinking = (face) =>
    face.eyes.some((eye) => eye.blink && eye.blink.currentTime < blinkMs);
  const dropBlinks = (face) => {
    face.eyes.forEach((eye) => {
      eye.blink?.cancel();
      eye.blink = null;
    });
  };
  const stopWander = (face, now, dt) => {
    face.wanderAnim.cancel();
    face.wanderAnim = null;

    const [gx, gy] = wanderAt(face.seed, now - wanderLag - dt);
    face.gx = gx;
    face.gy = gy;
    face.rotateWritten = "";
  };

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

    const woke = last === null;
    let dt = 16;
    if (last !== null) {
      dt = Math.min(now - last, 100);
      recent.push(dt);
      if (recent.length > 8) {
        recent.shift();
      }
    } else if (recent.length && [...faces].some((face) => face.wanderAnim)) {
      dt = Math.min(...recent);
    }
    last = now;

    let follow = false;
    faces.forEach((face) => {
      if (face.orb.isConnected) {
        if (
          (face.far || !face.visible) &&
          face.to === 1 &&
          (face.e !== face.to || now - face.start < face.dur)
        ) {
          const r = face.orb.getBoundingClientRect();
          face.far =
            r.bottom < -innerHeight / 2 ||
            r.top > innerHeight * 1.5 ||
            r.right < -innerWidth / 2 ||
            r.left > innerWidth * 1.5;
          if (!face.far && face.e === 1 && now - face.start < face.dur) {
            face.e = face.from;
          }
        }
        if (pointer && !face.rest) {
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

  const measure = () => {
    const at = performance.now();
    faces.forEach((face) => {
      if (!face.rest && face.visible && face.orb.isConnected) {
        face.rect = face.orb.getBoundingClientRect();
        face.rectAt = at;
      }
    });
  };

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

  const onScroll = () => {
    if (pointer && awake()) {
      measure();
    }

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

  const byOrb = new Map();
  const inView = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const face = byOrb.get(entry.target);
      if (!face) {
        return;
      }
      face.visible = entry.isIntersecting;

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
        face.rect = entry.boundingClientRect;
        face.rectAt = performance.now();
        if (
          face.to === 1 &&
          face.e === 1 &&
          performance.now() - face.start < face.dur
        ) {
          face.e = face.from;
          wake();
        }
        if (face.to === 1) {
          face.nextBlink = performance.now() + 900 + Math.random() * 1600;
          face.blinkTimer = window.setTimeout(
            wake,
            face.nextBlink - performance.now()
          );
        }
      } else if (!pointer) {
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

  const shapeN = 400;
  const shapePx = 384;
  const shapeFit = 0.56;
  const shapeWaves = 160;

  const shapeBox = 1.5;
  const floodOutside = (mask) => {
    const W = shapePx;
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

  const outline = (mask) => {
    const W = shapePx;
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
      if (!list?.length) {
        return;
      }
      const loop = [];
      let v = start;
      while (true) {
        list = next.get(v);
        if (!list?.length) {
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
    const waves = Math.min(shapeWaves, Math.floor(n / 2) - 1);
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
    canvas.width = shapePx;
    canvas.height = shapePx;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return null;
    }
    const f = (shapePx * shapeFit) / Math.max(vw, vh);
    const r = Math.max(0, closeK) * shapePx * shapeFit;
    const round = Math.max(0, roundK) * shapePx * shapeFit;
    ctx.setTransform(
      f,
      0,
      0,
      f,
      shapePx / 2 - (vx + vw / 2) * f,
      shapePx / 2 - (vy + vh / 2) * f
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
      const { data } = ctx.getImageData(0, 0, shapePx, shapePx);
      const mask = new Uint8Array(shapePx * shapePx);
      for (let i = 0; i < mask.length; i++) {
        mask[i] = data[i * 4 + 3] > 127 ? 1 : 0;
      }
      return mask;
    };

    const redraw = (loops, grow) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, shapePx, shapePx);
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
      loops = redraw(loops, -r);
    }
    if (loops && round > 0) {
      loops = redraw(loops, -round);
      if (loops) {
        loops = redraw(loops, round);
      }
    }
    if (!loops) {
      return null;
    }

    const lengths = loops.map(perimeter);
    const total = lengths.reduce((sum, l) => sum + l, 0);
    return loops.map((loop, i) =>
      series(
        resample(loop, Math.max(24, Math.round((shapeN * lengths[i]) / total)))
      )
    );
  };

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

    let reach = 0;
    for (const pts of loops) {
      for (const [x, y] of pts) {
        reach = Math.max(reach, Math.abs(x - cx), Math.abs(y - cy));
      }
    }
    const s = Math.min(
      size * Math.sqrt(Math.PI / Math.abs(total)),
      (shapeBox * 0.98) / 1.05 / (reach || 1)
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
    const k = 50 / shapeBox;
    let s = "";
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i];
      s += `${i ? "," : ""}${(50 + k * (p.cx + p.dx * m)).toFixed(2)}% ${(50 + k * (p.cy + p.dy * m)).toFixed(2)}%`;
    }
    return `polygon(${s})`;
  };

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

    const skin = orb.querySelector(".lp-orb-skin");
    const shapeSvg =
      document.getElementById(`lp-shape-${orb.dataset.icon}`)?.content
        ?.firstElementChild ?? markSvg;

    const shapeSetting = (key) => {
      const own = Number.parseFloat(orb.dataset[key] ?? "");
      return Number.isFinite(own) ? own : settings[key];
    };

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

      goal: null,

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

      series: null,
      seriesClose: null,
      shaped: false,
      shapeTask: 0,
      start: 0,
      tilt: 0,
      tiltWritten: "",
      to: 0,
      visible: true,

      wanderAnim: null,
      wanderFrom: null,

      written: -1,
      x: 1,
      xStart: 0,
      xWritten: -1,
    };

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
        face.shapeTask = idle(prepareShape);
      }
      face.goal = aim(face.expression);
      face.prior = face.goal;
      face.x = 1;
    };

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

      face.dirty = true;
      if (!face.rest) {
        wake();
      }
    };

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
        face.e =
          face.from +
          (1 - face.from) *
            easeBack(clamp01((performance.now() - face.start) / face.dur));
      }
      if (on && wantsShape() && face.polyKey !== shapeKey()) {
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

      if (face.x < 1) {
        const p = clamp01((now - face.xStart) / settings.expressMs);
        face.x = Math.min(p, 1);
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

      const wandering = !pointer && settings.wander && !settings.reduceMotion;

      if (!wandering) {
        face.wanderFrom = null;
      } else if (face.wanderFrom === null) {
        face.wanderFrom = now;
      }

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
        const bp = (now - face.blinkAt) / blinkMs;
        if ((face.marks || !blinking(face)) && bp >= 0 && bp < 1) {
          blink = 1 - 0.94 * Math.sin(Math.PI * bp);
          midBlink = true;
        }
      } else if (blinking(face)) {
        dropBlinks(face);
        face.blinkWritten = -1;
      }

      const shapeSame =
        e === face.written && face.x === face.xWritten && !face.dirty;
      const eyesSame = shapeSame && blink === face.blinkWritten;
      face.written = e;
      face.blinkWritten = blink;
      face.xWritten = face.x;
      face.dirty = false;
      if (!shapeSame) {
        if (face.poly) {
          if (e > 0 !== face.shaped) {
            skin.parentElement.classList.toggle("is-shaped", e > 0);
            face.shaped = e > 0;
          }
          skin.style.clipPath =
            e > 0 ? clipAt(face.poly, settings.shapeMix * e) : "";
        }

        face.arc.forEach((l) => {
          const lon = l.a + (l.lon - l.a) * e;
          l.el.style.transform = place(lon, l.lat * e, l.roll * e);
          l.glyph.style.opacity = "";
          l.glyph.style.transform =
            l.scale === 1
              ? ""
              : `translate(-50%, -50%) scale(${(1 + (l.scale - 1) * on).toFixed(3)})`;
        });

        if (mark && settings.mark !== "smile") {
          if (settings.mark === "nose") {
            mark.el.style.transform = place(
              mark.a * (1 - e),
              face.nose.lat * e
            );
            mark.glyph.style.transform = `translate(-50%, -50%) scale(${(1 - 0.2 * on).toFixed(3)})`;
            mark.glyph.style.opacity = "";
          } else {
            const k = clamp01(1 - e / 0.02);
            mark.el.style.transform = "";
            mark.glyph.style.opacity = k.toFixed(3);
            mark.glyph.style.transform = "";
          }
        }
      }
      if (!eyesSame) {
        const open = clamp01((e - 0.5) / 0.35);
        eyes.forEach((eye, i) => {
          const v = open * blink * face.lids[i];
          if (face.marks && eye.markEl) {
            if (eye.blink) {
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
            if (eye.blink && eye.blink.currentTime >= blinkMs) {
              eye.blink.cancel();
              eye.blink = null;
            }
            eye.lid.style.transform = `scaleY(${v.toFixed(3)})`;
            eye.pupil.style.transform = `scale(${(0.5 + 0.5 * open).toFixed(3)})`;
          }
        });
      }

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
