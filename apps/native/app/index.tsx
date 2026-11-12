import { ScrollView, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, type ButtonVariant } from "@/components/ui/button";
import { useThemeColors } from "@/lib/theme";

const variants: ButtonVariant[] = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
];

export default function Home() {
  const colors = useThemeColors();
  const scheme = useColorScheme();

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ backgroundColor: colors.background, flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ gap: 32, padding: 24 }}>
        <View style={{ gap: 4 }}>
          <Text
            style={{
              color: colors.foreground,
              fontSize: 24,
              fontWeight: "700",
            }}
          >
            Frakment Native
          </Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
            scheme: {scheme ?? "null"} | bg: {colors.background}
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Variants
          </Text>
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </Button>
          ))}
        </View>

        <View style={{ gap: 12 }}>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Sizes
          </Text>
          <View style={{ alignItems: "center", flexDirection: "row", gap: 8 }}>
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Disabled
          </Text>
          <Button disabled>Disabled</Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
