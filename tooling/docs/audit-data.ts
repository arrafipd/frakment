import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { auditComponentApiTables } from "./audit-api.ts";

interface RegistryManifest {
  components: { name: string }[];
}

interface AuditIssue {
  code: string;
  file: string;
  message: string;
}

interface AuditResult {
  filesScanned: number;
  issues: AuditIssue[];
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");

const readManifest = (filePath: string): RegistryManifest => {
  const parsed = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  ) as RegistryManifest;
  if (!Array.isArray(parsed.components)) {
    throw new Error(`Registry manifest has no components array: ${filePath}`);
  }
  return parsed;
};

const walkMdxFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return walkMdxFiles(fullPath);
    }
    return entry.isFile() && entry.name.endsWith(".mdx") ? [fullPath] : [];
  });

const relativeFile = (repoRootPath: string, filePath: string): string =>
  path.relative(repoRootPath, filePath).replace(/\\/gu, "/");

const maskCodeFences = (content: string): string =>
  content.replace(/^(```|~~~)[\s\S]*?^\1.*$/gmu, (block) =>
    block.replace(/[^\n]/gu, " ")
  );

const readAttributes = (source: string): Map<string, string> => {
  const attributes = new Map<string, string>();
  const expression = /([A-Za-z][\w-]*)=["']([^"']*)["']/gu;
  for (const match of source.matchAll(expression)) {
    attributes.set(match[1], match[2]);
  }
  return attributes;
};

const existsWithSourceExtension = (
  basePath: string,
  extensions: string[]
): boolean =>
  extensions.some((extension) => fs.existsSync(`${basePath}${extension}`));

const resolveLocalImport = (
  appRoot: string,
  specifier: string
): string | null => {
  const aliasPaths = [
    { directory: "examples", prefix: "@/examples/" },
    { directory: "components/ui", prefix: "@/components/ui/" },
  ];
  const match = aliasPaths.find(({ prefix }) => specifier.startsWith(prefix));
  if (!match) {
    return null;
  }
  const suffix = specifier.slice(match.prefix.length);
  const target = path.resolve(appRoot, match.directory, suffix);
  const allowedRoot = path.resolve(appRoot, match.directory) + path.sep;
  if (!target.startsWith(allowedRoot)) {
    return null;
  }
  return target;
};

const collectDocRoutes = (docsRoot: string): Set<string> => {
  const routes = new Set<string>();
  for (const filePath of walkMdxFiles(docsRoot)) {
    const slug = path
      .relative(docsRoot, filePath)
      .replace(/\\/gu, "/")
      .replace(/\.mdx$/u, "");
    if (slug === "index") {
      routes.add("/docs");
    } else if (slug.endsWith("/index")) {
      routes.add(`/docs/${slug.slice(0, -"/index".length)}`);
    } else {
      routes.add(`/docs/${slug}`);
    }
  }
  return routes;
};

const normalizeDocLink = (url: string): string => {
  const pathname = url.split(/[?#]/u, 1)[0] || "/docs";
  return pathname.length > 1 ? pathname.replace(/\/+$/u, "") : pathname;
};

const findDocLinkTargets = (content: string): string[] => {
  const targets = new Set<string>();
  const markdownLink = /\]\((\/docs(?:\/[^)\s]*)?)(?:\s+["'][^)]*["'])?\)/gu;
  const jsxHref = /\bhref=["'](\/docs(?:\/[^"']*)?)["']/gu;
  for (const expression of [markdownLink, jsxHref]) {
    for (const match of content.matchAll(expression)) {
      targets.add(normalizeDocLink(match[1]));
    }
  }
  return [...targets];
};

const checkRegistryDocs = (
  repoRootPath: string,
  docsRoot: string,
  registryNames: Set<string>,
  platform: "web" | "native",
  issues: AuditIssue[]
) => {
  const docsDirectory = path.join(docsRoot, "components", platform);
  for (const name of registryNames) {
    const pagePath = path.join(docsDirectory, `${name}.mdx`);
    const utilityPage =
      platform === "web" &&
      fs.existsSync(path.join(docsRoot, "utilities", `${name}.mdx`));
    if (!(fs.existsSync(pagePath) || utilityPage)) {
      issues.push({
        code: "missing-component-doc",
        file: relativeFile(repoRootPath, pagePath),
        message: `Registry component "${name}" has no ${platform} docs page.`,
      });
    }
  }

  if (!fs.existsSync(docsDirectory)) {
    return;
  }
  for (const pagePath of walkMdxFiles(docsDirectory)) {
    if (path.basename(pagePath) === "index.mdx") {
      continue;
    }
    const name = path.basename(pagePath, ".mdx");
    if (!registryNames.has(name)) {
      issues.push({
        code: "orphan-component-doc",
        file: relativeFile(repoRootPath, pagePath),
        message: `No ${platform} registry component named "${name}" exists.`,
      });
    }
  }
};

export const auditDocsData = async (
  repoRootPath: string
): Promise<AuditResult> => {
  const appRoot = path.join(repoRootPath, "apps/web");
  const docsRoot = path.join(appRoot, "content/docs");
  const webManifest = readManifest(path.join(appRoot, "frakment.json"));
  const nativeManifest = readManifest(
    path.join(repoRootPath, "apps/native/frakment.json")
  );
  const webNames = new Set(webManifest.components.map(({ name }) => name));
  const nativeNames = new Set(
    nativeManifest.components.map(({ name }) => name)
  );
  const docsFiles = walkMdxFiles(docsRoot);
  const routes = collectDocRoutes(docsRoot);
  const issues: AuditIssue[] = [];

  checkRegistryDocs(repoRootPath, docsRoot, webNames, "web", issues);
  checkRegistryDocs(repoRootPath, docsRoot, nativeNames, "native", issues);

  for (const filePath of docsFiles) {
    const rawContent = fs.readFileSync(filePath, "utf8");
    const content = maskCodeFences(rawContent);
    const file = relativeFile(repoRootPath, filePath);
    const isHistorical = file.startsWith("apps/web/content/docs/changelog/");

    if (!isHistorical) {
      for (const match of content.matchAll(
        /from\s*["'](@\/(?:examples|components\/ui)\/[^"']+)["']/gu
      )) {
        const target = resolveLocalImport(appRoot, match[1]);
        if (
          target &&
          !existsWithSourceExtension(target, [
            "",
            ".tsx",
            ".ts",
            ".jsx",
            ".js",
            ".mjs",
          ])
        ) {
          issues.push({
            code: "missing-local-import",
            file,
            message: `Local import "${match[1]}" does not resolve to a source file.`,
          });
        }
      }

      for (const tagName of ["ComponentPreview", "ComponentSource"]) {
        const tags = new RegExp(`<${tagName}\\b([\\s\\S]*?)\\/?>`, "gu");
        for (const match of content.matchAll(tags)) {
          const attributes = readAttributes(match[1]);
          const source = attributes.get("src");
          const name = attributes.get("name");
          let target: string | null = null;

          if (source) {
            target = path.resolve(appRoot, source);
            const allowedRoot = appRoot + path.sep;
            if (!target.startsWith(allowedRoot)) {
              target = null;
            }
          } else if (name && tagName === "ComponentSource") {
            const candidatePaths = [
              path.join(appRoot, "examples", name),
              path.join(appRoot, "registry", name),
            ];
            const extensions = [".tsx", ".ts", ".js", ".d.ts"];
            if (
              !candidatePaths.some((candidate) =>
                existsWithSourceExtension(candidate, extensions)
              )
            ) {
              issues.push({
                code: "missing-component-source",
                file,
                message: `<ComponentSource name="${name}"> has no matching example or registry source.`,
              });
            }
            continue;
          }

          if (
            target &&
            !fs.existsSync(target) &&
            !existsWithSourceExtension(target, [
              ".tsx",
              ".ts",
              ".jsx",
              ".js",
              ".mjs",
            ])
          ) {
            issues.push({
              code: "missing-preview-source",
              file,
              message: `<${tagName} src="${source}"> does not resolve under apps/web.`,
            });
          }
        }
      }
    }

    for (const target of findDocLinkTargets(content)) {
      if (!routes.has(target)) {
        issues.push({
          code: "missing-doc-link",
          file,
          message: `Local docs link "${target}" does not match an MDX route.`,
        });
      }
    }

    const commandText = isHistorical ? "" : rawContent;
    for (const match of commandText.matchAll(
      /\bnpx\s+frakment(?:@[^\s`]+)?\s+add\s+([^\n`]+)/gu
    )) {
      const args = match[1]
        .split(/\s+/u)
        .map((token) => token.replace(/[;,]+$/u, ""))
        .filter(Boolean);
      for (const token of args) {
        if (token.startsWith("-") || token.startsWith("<")) {
          continue;
        }
        if (!(webNames.has(token) || nativeNames.has(token))) {
          issues.push({
            code: "unknown-registry-command",
            file,
            message: `Install command references unknown registry item "${token}".`,
          });
        }
      }
    }
  }

  issues.push(...(await auditComponentApiTables(repoRootPath, docsFiles)));
  return { filesScanned: docsFiles.length, issues };
};

const main = async () => {
  const result = await auditDocsData(repoRoot);
  const counts = new Map<string, number>();
  for (const issue of result.issues) {
    counts.set(issue.code, (counts.get(issue.code) ?? 0) + 1);
  }

  console.log(`Scanned ${result.filesScanned} MDX files.`);
  for (const [code, count] of counts) {
    console.log(`  ${code}: ${count}`);
  }
  for (const issue of result.issues) {
    console.log(`${issue.file}: ${issue.code}: ${issue.message}`);
  }

  if (result.issues.length > 0) {
    process.exitCode = 1;
    console.log(`\n${result.issues.length} source-data mismatch(es) found.`);
    return;
  }
  console.log("No source-data mismatches found.");
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
