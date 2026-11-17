import { Text, View } from "react-native";

import { Separator } from "@/components/ui/separator";

export function SeparatorVerticalExample() {
  return (
    <View className="h-6 flex-row items-center gap-4">
      <Text>Docs</Text>
      <Separator orientation="vertical" />
      <Text>Source</Text>
      <Separator orientation="vertical" />
      <Text>Design</Text>
    </View>
  );
}
