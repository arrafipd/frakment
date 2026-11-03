import path from "node:path";

import { readFileFromRoot } from "@/lib/read-file";

export const readOptionalFromRoot = async (
  relativePath: string
): Promise<string | null> => {
  try {
    return await readFileFromRoot(relativePath);
  } catch {
    return null;
  }
};

export const getRegistryUiSourceCandidates = ({ name }: { name: string }) => [
  path.join("registry", `${name}.tsx`),
];

export const getDemoSource = (name: string): Promise<string | null> =>
  readOptionalFromRoot(path.join("examples", `${name}.tsx`));

export const getRegistrySource = async (
  name: string
): Promise<string | null> => {
  const candidates = getRegistryUiSourceCandidates({ name });

  for (const candidate of candidates) {
    const code = await readOptionalFromRoot(candidate);
    if (code) {
      return code;
    }
  }

  return null;
};

export const getDemoItem = async (
  name: string,
  _styleName: string
): Promise<{ files: { content: string }[] } | null> => {
  const content = await getDemoSource(name);
  if (!content) {
    return null;
  }
  return { files: [{ content }] };
};

export const getRegistryItem = async (
  name: string,
  _styleName: string
): Promise<{ files: { content: string }[] } | null> => {
  const content = await getRegistrySource(name);
  if (!content) {
    return null;
  }
  return { files: [{ content }] };
};

export const getRegistryComponent = (
  name: string,
  _styleName: string
): React.ComponentType | null => {
  const candidates = [`@/components/ui/${name}`, `@/components/${name}`];

  for (const candidate of candidates) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(candidate);
      const comp = (mod as { default?: React.ComponentType }).default;
      if (comp) {
        return comp;
      }
    } catch {
      // continue to next candidate
    }
  }

  return null;
};
