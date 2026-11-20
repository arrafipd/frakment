import { useTheme } from "next-themes";
import { useCallback, useMemo } from "react";

import { metaThemeColors } from "@/config/site";

export const useMetaColor = () => {
  const { resolvedTheme } = useTheme();

  const metaColor = useMemo(
    () =>
      resolvedTheme === "dark" ? metaThemeColors.dark : metaThemeColors.light,
    [resolvedTheme]
  );

  const setMetaColor = useCallback((color: string) => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", color);
  }, []);

  return {
    metaColor,
    setMetaColor,
  };
};
