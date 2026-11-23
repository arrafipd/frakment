import type { ViewProps, ViewStyle } from "react-native";
import { View } from "react-native";

import { useThemeColors } from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface SeparatorProps extends Omit<ViewProps, "style"> {
  decorative?: boolean;
  orientation?: "horizontal" | "vertical";
  style?: ViewStyle;
}

function Separator({
  decorative = true,
  orientation = "horizontal",
  className,
  style,
  ...props
}: SeparatorProps) {
  const colors = useThemeColors();
  const isHorizontal = orientation === "horizontal";

  const baseStyle: ViewStyle = {
    backgroundColor: colors.border,
    flexShrink: 0,
    ...(isHorizontal
      ? { height: 1, width: "100%" }
      : { alignSelf: "stretch", width: 1 }),
    ...style,
  };

  return (
    <View
      accessible={!decorative}
      className={cn(className)}
      role={decorative ? "none" : "separator"}
      style={baseStyle}
      {...props}
    />
  );
}

export { Separator };
