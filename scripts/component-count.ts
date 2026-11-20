import fs from "node:fs";

const webManifest = JSON.parse(
  fs.readFileSync("apps/web/frakment.json", "utf8")
) as { components: unknown[] };
const nativeManifest = JSON.parse(
  fs.readFileSync("apps/native/frakment.json", "utf8")
) as { components: unknown[] };

console.log(
  `Frakment registry: ${webManifest.components.length} web components, ${nativeManifest.components.length} native components`
);
