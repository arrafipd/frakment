import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../apps/web"
);

const schema = JSON.parse(
  fs.readFileSync(path.join(rootDir, "public/schema/frakment.json"), "utf8")
);
const manifest = JSON.parse(
  fs.readFileSync(path.join(rootDir, "frakment.json"), "utf8")
);

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

if (!validate(manifest)) {
  console.error("Manifest validation failed:");
  for (const err of validate.errors || []) {
    console.error(`  ${err.instancePath || "(root)"}: ${err.message}`);
  }
  process.exit(1);
}

console.log(
  `OK Manifest valid (${manifest.components.length} components, ${manifest.skills?.length || 0} skills)`
);
