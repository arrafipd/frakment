import { Stack } from "expo-router";
import { StatusBar, useColorScheme, View } from "react-native";

import { useThemeColors } from "@/lib/theme";
import "../global.css";

export default function RootLayout() {
  const colors = useThemeColors();
  const scheme = useColorScheme();

  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "transparent" },
          headerShown: false,
        }}
      />
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
      />
    </View>
  );
}
