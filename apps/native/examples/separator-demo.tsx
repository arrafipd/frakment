import { Text, View } from "react-native";

import { Separator } from "@/components/ui/separator";

export function SeparatorDemoExample() {
  return (
    <View className="gap-3">
      <Text>Above</Text>
      <Separator />
      <Text>Below</Text>
    </View>
  );
}
