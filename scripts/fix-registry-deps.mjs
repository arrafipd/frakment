import fs from "node:fs";
import path from "node:path";

const MANIFEST = "frakment.json";
const REGISTRY_DIR = "registry";
const ROOT_PKG = JSON.parse(fs.readFileSync("package.json", "utf8"));
const allDeps = { ...ROOT_PKG.dependencies, ...ROOT_PKG.devDependencies };

// Build version map, resolve workspace:* from packages/*/package.json
const versionMap = { ...allDeps };
for (const dir of fs.readdirSync("packages")) {
  const pkgPath = path.join("packages", dir, "package.json");
  if (!fs.existsSync(pkgPath)) {
    continue;
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  versionMap[pkg.name] = pkg.version;
}

const TRACKED_PKGS = [
  "radix-ui",
  "class-variance-authority",
  "lucide-react",
  "motion",
  "@number-flow/react",
  "input-otp",
  "sonner",
  "next-themes",
  "ai",
  "@frakment/ai",
  "@frakment/react",
];

const IMPORT_PATTERNS = {
  "@frakment/ai": /from\s+["']@frakment\/ai["']/,
  "@frakment/react": /from\s+["']@frakment\/react["']/,
  "@number-flow/react": /from\s+["']@number-flow\/react["']/,
  ai: /from\s+["']ai["']/,
  "class-variance-authority": /from\s+["']class-variance-authority["']/,
  "input-otp": /from\s+["']input-otp["']/,
  "lucide-react": /from\s+["']lucide-react["']/,
  motion: /from\s+["']motion\/react["']|from\s+["']motion["']/,
  "next-themes": /from\s+["']next-themes["']/,
  "radix-ui": /from\s+["']radix-ui["']|from\s+["']@radix-ui\//,
  sonner: /from\s+["']sonner["']/,
};

function resolveVersion(pkg) {
  const v = versionMap[pkg];
  if (!v) {
    return null;
  }
  if (v.startsWith("workspace:")) {
    return null; // safety
  }
  return /^[\^~=]/.test(v) ? v : "^" + v;
}

const data = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
let fixed = 0;
const log = [];

for (const c of data.components) {
  const srcPath = path.join(REGISTRY_DIR, `${c.name}.tsx`);
  if (!fs.existsSync(srcPath)) {
    continue;
  }
  const src = fs.readFileSync(srcPath, "utf8");

  // Normalize existing deps: "foo" -> "foo@^x.y.z"
  const normalized = new Map();
  for (const d of c.dependencies || []) {
    if (typeof d !== "string") {
      continue;
    }
    if (d.includes("@") && !d.startsWith("@")) {
      // scoped check: "foo@^1.0" or "@scope/foo@^1.0"
      const parts = d.split("@");
      const hasVersion =
        parts.length > 1 &&
        parts[parts.length - 1].length > 0 &&
        /^[\^~=0-9]/.test(parts[parts.length - 1]);
      if (hasVersion) {
        normalized.set(
          d.split("@")[0] + (d.startsWith("@") ? "@" + d.split("@")[1] : ""),
          d
        );
        continue;
      }
    }
    if (d.startsWith("@")) {
      // scoped: "@scope/foo" or "@scope/foo@^1.0"
      const atIdx = d.indexOf("@", 1);
      if (atIdx > 0) {
        normalized.set(d.slice(0, atIdx), d);
        continue;
      }
    } else if (d.includes("@")) {
      normalized.set(d.split("@")[0], d);
      continue;
    }
    // no version — add
    const v = resolveVersion(d);
    normalized.set(d, v ? `${d}@${v}` : d);
  }

  // Add missing
  const declaredNames = new Set([...normalized.keys()]);
  for (const pkg of TRACKED_PKGS) {
    if (IMPORT_PATTERNS[pkg].test(src) && !declaredNames.has(pkg)) {
      const v = resolveVersion(pkg);
      if (v) {
        normalized.set(pkg, `${pkg}@${v}`);
        declaredNames.add(pkg);
      }
    }
  }

  const newDeps = [...normalized.values()].sort();
  const oldDeps = JSON.stringify(c.dependencies || []);
  const newDepsStr = JSON.stringify(newDeps);
  if (oldDeps !== newDepsStr) {
    c.dependencies = newDeps;
    fixed++;
    log.push(`  ${c.name}: ${oldDeps} -> ${newDepsStr}`);
  }
}

function fmt(v, depth = 0) {
  const pad = "  ".repeat(depth);
  const padIn = "  ".repeat(depth + 1);
  if (v === null || typeof v !== "object") {
    return JSON.stringify(v);
  }
  if (Array.isArray(v)) {
    if (v.length === 0) {
      return "[]";
    }
    const items = v.map((x) => fmt(x, depth + 1));
    const single = "[" + items.join(", ") + "]";
    if (
      v.every((x) => x === null || typeof x !== "object") &&
      single.length <= 80
    ) {
      return single;
    }
    return "[\n" + items.map((x) => padIn + x).join(",\n") + "\n" + pad + "]";
  }
  const keys = Object.keys(v);
  if (keys.length === 0) {
    return "{}";
  }
  return (
    "{\n" +
    keys
      .map((k) => padIn + JSON.stringify(k) + ": " + fmt(v[k], depth + 1))
      .join(",\n") +
    "\n" +
    pad +
    "}"
  );
}

fs.writeFileSync(MANIFEST, fmt(data) + "\n", "utf8");
console.log(`Updated ${fixed} component(s):`);
log.slice(0, 10).forEach((l) => console.log(l));
if (log.length > 10) {
  console.log(`  ... and ${log.length - 10} more`);
}
