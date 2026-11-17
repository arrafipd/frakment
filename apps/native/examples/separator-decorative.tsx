import { Text, View } from "react-native";

import { Separator } from "@/components/ui/separator";

export function SeparatorDecorativeExample() {
  return (
    <View className="gap-4">
      <Text>Section one</Text>
      <Separator decorative={false} />
      <Text>Section two</Text>
    </View>
  );
}
