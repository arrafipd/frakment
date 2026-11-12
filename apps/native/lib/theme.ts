import { useColorScheme } from "react-native";

export interface ThemeColors {
  accent: string;
  accentForeground: string;
  background: string;
  border: string;
  destructive: string;
  destructiveForeground: string;
  destructiveHover: string;
  foreground: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  primaryHover: string;
  secondary: string;
  secondaryForeground: string;
  secondaryHover: string;
}

// Values match apps/web/styles/theme.css oklch → hex
const LIGHT: ThemeColors = {
  accent: "#f5f5f5",
  accentForeground: "#171717",
  background: "#ffffff",
  border: "#e5e5e5",
  destructive: "#ef4444",
  destructiveForeground: "#ffffff",
  destructiveHover: "#f05656", // destructive/90 over white
  foreground: "#0a0a0a",
  mutedForeground: "#666666",
  primary: "#171717",
  primaryForeground: "#fafafa",
  primaryHover: "#2e2e2e", // primary/90 over white
  secondary: "#f5f5f5",
  secondaryForeground: "#171717",
  secondaryHover: "#f7f7f7", // secondary/80 over white
};

const DARK: ThemeColors = {
  accent: "#404040",
  accentForeground: "#fafafa",
  background: "#0a0a0a",
  border: "rgba(255,255,255,0.1)",
  destructive: "#f87171",
  destructiveForeground: "#ffffff",
  destructiveHover: "#e06666", // destructive/90 over #0a0a0a
  foreground: "#fafafa",
  mutedForeground: "#a3a3a3",
  primary: "#e5e5e5",
  primaryForeground: "#171717",
  primaryHover: "#cfcfcf", // primary/90 over #0a0a0a
  secondary: "#262626",
  secondaryForeground: "#fafafa",
  secondaryHover: "#212121", // secondary/80 over #0a0a0a
};

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? DARK : LIGHT;
}
