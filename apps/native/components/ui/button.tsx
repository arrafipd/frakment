import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import {
  Pressable,
  type PressableProps,
  Text,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { type ThemeColors, useThemeColors } from "@/lib/theme";
import { cn } from "@/lib/utils";

// Exact size in dp. lg = 50 (default 48 + 2).
type SizeKey =
  | "xs"
  | "sm"
  | "default"
  | "lg"
  | "icon-xs"
  | "icon-sm"
  | "icon"
  | "icon-lg";

const SIZE_DIM: Record<SizeKey, { height: number; width?: number }> = {
  default: { height: 48 },
  icon: { height: 48, width: 48 },
  "icon-lg": { height: 51, width: 51 },
  "icon-sm": { height: 44, width: 44 },
  "icon-xs": { height: 40, width: 40 },
  lg: { height: 51 },
  sm: { height: 44 },
  xs: { height: 40 },
};

const buttonVariants = cva(
  "shrink-0 flex-row items-center justify-center gap-2 rounded-md",
  {
    defaultVariants: { size: "default" },
    variants: {
      size: {
        default: "px-6",
        icon: "p-0",
        "icon-lg": "p-0",
        "icon-sm": "p-0",
        "icon-xs": "p-0",
        lg: "px-8",
        sm: "gap-1.5 px-5",
        xs: "gap-1 px-4",
      },
    },
  }
);

export type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";

const SHADOW_XS: ViewStyle = {
  elevation: 1,
  shadowColor: "#000",
  shadowOffset: { height: 1, width: 0 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
};

interface VariantStyle {
  base: ViewStyle;
  pressed: ViewStyle;
  textBase: TextStyle;
  textPressed: TextStyle;
}

function getVariantStyle(variant: ButtonVariant, c: ThemeColors): VariantStyle {
  switch (variant) {
    case "default":
      return {
        base: { backgroundColor: c.primary, ...SHADOW_XS },
        pressed: { backgroundColor: c.primaryHover },
        textBase: { color: c.primaryForeground },
        textPressed: { color: c.primaryForeground },
      };
    case "secondary":
      return {
        base: { backgroundColor: c.secondary, ...SHADOW_XS },
        pressed: { backgroundColor: c.secondaryHover },
        textBase: { color: c.secondaryForeground },
        textPressed: { color: c.secondaryForeground },
      };
    case "outline":
      return {
        base: {
          backgroundColor: "transparent",
          borderColor: c.border,
          borderWidth: 1,
          ...SHADOW_XS,
        },
        pressed: { backgroundColor: c.accent },
        textBase: { color: c.foreground },
        textPressed: { color: c.accentForeground },
      };
    case "ghost":
      return {
        base: { backgroundColor: "transparent" },
        pressed: { backgroundColor: c.accent },
        textBase: { color: c.foreground },
        textPressed: { color: c.accentForeground },
      };
    case "destructive":
      return {
        base: { backgroundColor: c.destructive, ...SHADOW_XS },
        pressed: { backgroundColor: c.destructiveHover },
        textBase: { color: c.destructiveForeground },
        textPressed: { color: c.destructiveForeground },
      };
    case "link":
      return {
        base: { backgroundColor: "transparent" },
        pressed: {},
        textBase: {
          borderBottomColor: "transparent",
          borderBottomWidth: 1,
          color: c.primary,
          paddingBottom: 1,
        },
        textPressed: {
          borderBottomColor: c.primary,
        },
      };
    default:
      return {
        base: { backgroundColor: c.primary, ...SHADOW_XS },
        pressed: { backgroundColor: c.primaryHover },
        textBase: { color: c.primaryForeground },
        textPressed: { color: c.primaryForeground },
      };
  }
}

export interface ButtonProps
  extends Omit<PressableProps, "children" | "style">,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  style?: ViewStyle;
  variant?: ButtonVariant;
}

function Button({
  className,
  variant = "default",
  size,
  children,
  disabled,
  style,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const colors = useThemeColors();
  const [pressed, setPressed] = React.useState(false);
  const vs = getVariantStyle(variant, colors);
  const dim = SIZE_DIM[(size ?? "default") as SizeKey] ?? SIZE_DIM.default;

  const containerStyle: ViewStyle = {
    height: dim.height,
    ...(dim.width === undefined ? null : { width: dim.width }),
    ...vs.base,
    ...(pressed && !disabled ? vs.pressed : null),
    ...style,
  };

  const finalTextStyle: TextStyle = {
    ...vs.textBase,
    ...(pressed && !disabled ? vs.textPressed : null),
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      className={cn(
        buttonVariants({ size }),
        disabled && "opacity-50",
        className
      )}
      disabled={disabled}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={containerStyle}
      {...props}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text style={finalTextStyle}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export { Button, buttonVariants };
