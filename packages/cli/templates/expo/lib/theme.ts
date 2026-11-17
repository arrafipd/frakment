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
  input: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  primaryHover: string;
  secondary: string;
  secondaryForeground: string;
  secondaryHover: string;
}

const lightColors: ThemeColors = {
  accent: "rgba(245, 245, 245, 1)",
  accentForeground: "rgba(23, 23, 23, 1)",
  background: "rgba(255, 255, 255, 1)",
  border: "rgba(229, 229, 229, 1)",
  destructive: "rgba(239, 68, 68, 1)",
  destructiveForeground: "rgba(255, 255, 255, 1)",
  destructiveHover: "rgba(240, 86, 86, 1)",
  foreground: "rgba(10, 10, 10, 1)",
  input: "rgba(227, 227, 227, 1)",
  mutedForeground: "rgba(102, 102, 102, 1)",
  primary: "rgba(23, 23, 23, 1)",
  primaryForeground: "rgba(250, 250, 250, 1)",
  primaryHover: "rgba(46, 46, 46, 1)",
  secondary: "rgba(245, 245, 245, 1)",
  secondaryForeground: "rgba(23, 23, 23, 1)",
  secondaryHover: "rgba(247, 247, 247, 1)",
};

const darkColors: ThemeColors = {
  accent: "rgba(64, 64, 64, 1)",
  accentForeground: "rgba(250, 250, 250, 1)",
  background: "rgba(10, 10, 10, 1)",
  border: "rgba(255, 255, 255, 0.1)",
  destructive: "rgba(248, 113, 113, 1)",
  destructiveForeground: "rgba(255, 255, 255, 1)",
  destructiveHover: "rgba(224, 102, 102, 1)",
  foreground: "rgba(250, 250, 250, 1)",
  input: "rgba(255, 255, 255, 0.15)",
  mutedForeground: "rgba(163, 163, 163, 1)",
  primary: "rgba(229, 229, 229, 1)",
  primaryForeground: "rgba(23, 23, 23, 1)",
  primaryHover: "rgba(207, 207, 207, 1)",
  secondary: "rgba(38, 38, 38, 1)",
  secondaryForeground: "rgba(250, 250, 250, 1)",
  secondaryHover: "rgba(33, 33, 33, 1)",
};

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}
