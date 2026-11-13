import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import {
  Text,
  type TextStyle,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { Separator } from "@/components/ui/separator";
import { useThemeColors } from "@/lib/theme";
import { cn } from "@/lib/utils";

const buttonGroupVariants = cva("flex w-fit", {
  defaultVariants: {
    orientation: "horizontal",
  },
  variants: {
    orientation: {
      horizontal: "flex-row items-stretch",
      vertical: "flex-col items-stretch",
    },
  },
});

function ButtonGroup({
  className,
  orientation = "horizontal",
  style,
  children,
  ...props
}: Omit<ViewProps, "style"> &
  VariantProps<typeof buttonGroupVariants> & { style?: ViewStyle }) {
  const isHorizontal = orientation !== "vertical";
  const items = React.Children.toArray(children);
  const validIndexes = items
    .map((c, i) => (React.isValidElement(c) ? i : -1))
    .filter((i) => i >= 0);
  const getChildTypeName = (c: React.ReactNode): string | undefined => {
    if (!React.isValidElement(c)) {
      return undefined;
    }
    const t = (c as React.ReactElement).type;
    if (typeof t === "function") {
      return (t as { name?: string }).name;
    }
    return undefined;
  };

  const firstIdx = validIndexes[0];
  const lastIdx = validIndexes.at(-1);
  const hasNestedGroups = items.some(
    (c) =>
      React.isValidElement(c) && (c as React.ReactElement).type === ButtonGroup
  );

  return (
    <View
      className={cn(
        buttonGroupVariants({ orientation }),
        hasNestedGroups && "gap-2",
        className
      )}
      style={style}
      {...props}
    >
      {items.map((child, index) => {
        if (!React.isValidElement(child)) {
          return child;
        }
        const typeName = getChildTypeName(child);
        if (typeName === "ButtonGroup" || typeName === "ButtonGroupSeparator") {
          return child;
        }
        const isFirst = index === firstIdx;
        const isLast = index === lastIdx;
        const overrides: Record<string, number> = {};
        if (!isFirst) {
          if (isHorizontal) {
            overrides.borderLeftWidth = 0;
            overrides.borderTopLeftRadius = 0;
            overrides.borderBottomLeftRadius = 0;
          } else {
            overrides.borderTopWidth = 0;
            overrides.borderTopLeftRadius = 0;
            overrides.borderTopRightRadius = 0;
          }
        }
        if (!isLast) {
          if (isHorizontal) {
            overrides.borderTopRightRadius = 0;
            overrides.borderBottomRightRadius = 0;
          } else {
            overrides.borderBottomLeftRadius = 0;
            overrides.borderBottomRightRadius = 0;
          }
        }
        const childProps = child.props as { style?: ViewStyle };
        const mergedStyle: ViewStyle = {
          ...overrides,
          ...childProps.style,
        } as ViewStyle;
        return React.cloneElement(
          child as React.ReactElement<{ style?: ViewStyle }>,
          { style: mergedStyle }
        );
      })}
    </View>
  );
}

function ButtonGroupText({
  className,
  style,
  children,
  ...props
}: Omit<ViewProps, "style"> & { style?: ViewStyle }) {
  const colors = useThemeColors();

  const baseStyle: ViewStyle = {
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
    ...style,
  };

  const textStyle: TextStyle = {
    color: colors.secondaryForeground,
    fontSize: 14,
    fontWeight: "500",
  };

  return (
    <View className={cn(className)} style={baseStyle} {...props}>
      {React.Children.map(children, (child) =>
        typeof child === "string" || typeof child === "number" ? (
          <Text style={textStyle}>{child}</Text>
        ) : (
          child
        )
      )}
    </View>
  );
}

function ButtonGroupSeparator({
  orientation = "vertical",
  style,
  ...props
}: Omit<React.ComponentProps<typeof Separator>, "style"> & {
  style?: ViewStyle;
}) {
  const colors = useThemeColors();
  const marginStyle: ViewStyle =
    orientation === "vertical"
      ? { marginVertical: 1 }
      : { marginHorizontal: 1 };
  return (
    <Separator
      orientation={orientation}
      style={{
        alignSelf: "stretch",
        backgroundColor: colors.input,
        ...marginStyle,
        ...style,
      }}
      {...props}
    />
  );
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
};
