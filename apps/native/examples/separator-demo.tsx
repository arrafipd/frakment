import { Text, View } from "react-native";

import { Separator } from "@/components/ui/separator";

export function SeparatorDemoExample() {
  return (
    <View className="gap-4">
      <View className="gap-1.5">
        <Text className="text-base leading-none font-medium">frakment</Text>
        <Text className="text-muted-foreground text-sm">
          Primitives for AI interfaces
        </Text>
      </View>
      <Separator />
      <Text className="text-sm">
        A set of beautifully designed components you can customize, extend, and
        build on.
      </Text>
    </View>
  );
}
