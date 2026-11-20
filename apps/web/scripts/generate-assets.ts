#!/usr/bin/env node
import { execSync, spawn } from "node:child_process";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = process.cwd();
const ASSETS = path.join(ROOT, "assets");
const PORT = 3001;
const URL = `http://localhost:${PORT}`;

const VIEWPORT = { height: 1080, width: 1920 };
const DEVICE_SCALE = 4;
const PIXEL_DIM = `${VIEWPORT.width * DEVICE_SCALE}x${VIEWPORT.height * DEVICE_SCALE}`;

function killTree(pid) {
  if (process.platform === "win32") {
    try {
      execSync(`taskkill /F /T /PID ${pid}`, { stdio: "ignore" });
    } catch {}
  } else {
    try {
      process.kill(-pid, "SIGTERM");
    } catch {}
  }
}

async function waitForServer(url, timeoutMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok || res.status === 404) {
        return;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server not ready after ${timeoutMs}ms`);
}

async function main() {
  await fs.mkdir(ASSETS, { recursive: true });

  console.log(`[1/4] starting next dev on :${PORT}`);
  const nextBin = path.join(
    ROOT,
    "node_modules",
    "next",
    "dist",
    "bin",
    "next"
  );
  const dev = spawn("node", [nextBin, "dev", "-p", String(PORT)], {
    cwd: ROOT,
    stdio: "pipe",
  });
  dev.stdout.on("data", (d) => process.stdout.write(`[dev] ${d}`));
  dev.stderr.on("data", (d) => process.stderr.write(`[dev] ${d}`));

  let browser;
  try {
    await waitForServer(URL);
    console.log("[2/4] server ready, launching chromium");
    browser = await chromium.launch();

    console.log(
      `[3/4] screenshot hero @ ${PIXEL_DIM} (dark, dsf=${DEVICE_SCALE})`
    );
    const heroCtx = await browser.newContext({
      colorScheme: "dark",
      deviceScaleFactor: DEVICE_SCALE,
      viewport: VIEWPORT,
    });
    await heroCtx.addInitScript(() => {
      try {
        localStorage.setItem("theme", "dark");
      } catch {}
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    });
    const heroPage = await heroCtx.newPage();
    await heroPage.goto(URL, { waitUntil: "domcontentloaded" });
    await heroPage.waitForSelector("h1", { timeout: 20_000 });
    await heroPage.waitForTimeout(2500);
    const heroPath = path.join(ASSETS, "hero-dark.webp");
    await heroPage.screenshot({
      fullPage: false,
      path: heroPath,
      quality: 85,
      type: "webp",
    });
    console.log("  saved:", heroPath);
    await heroPage.close();
    await heroCtx.close();

    console.log("[4/4] screenshot og @ 1200x630 (dark)");
    const ogCtx = await browser.newContext({
      colorScheme: "dark",
      deviceScaleFactor: 1,
      viewport: { height: 630, width: 1200 },
    });
    await ogCtx.addInitScript(() => {
      try {
        localStorage.setItem("theme", "dark");
      } catch {}
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    });
    const ogPage = await ogCtx.newPage();
    await ogPage.goto(URL, { waitUntil: "domcontentloaded" });
    await ogPage.waitForSelector("h1", { timeout: 20_000 });
    await ogPage.waitForTimeout(2500);
    const ogPath = path.join(ASSETS, "og.png");
    await ogPage.screenshot({ path: ogPath, type: "png" });
    console.log("  saved:", ogPath);
    await ogPage.close();
    await ogCtx.close();

    await browser.close();
    browser = null;

    const s1 = await fs.stat(heroPath);
    const s2 = await fs.stat(ogPath);
    console.log("\n=== DONE ===");
    console.log(
      `assets/hero-dark.webp : ${(s1.size / 1024 / 1024).toFixed(2)} MB  (${PIXEL_DIM})`
    );
    console.log(
      `assets/og.png         : ${(s2.size / 1024).toFixed(0)} KB  (1200x630)`
    );
    if (s1.size > 10 * 1024 * 1024) {
      console.warn(
        "\nWARNING: hero-dark.webp > 10 MB (GitHub limit). Turunkan quality 85 -> 70."
      );
    }
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
    killTree(dev.pid);
    await new Promise((r) => setTimeout(r, 1000));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
