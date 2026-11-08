import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

const packageManagerAtom = atomWithStorage<PackageManager>(
  "frakment:package-manager",
  "npm"
);

export const usePackageManager = () => useAtom(packageManagerAtom);
