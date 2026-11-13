import { ArrowUpIcon } from "lucide-react-native";
import { View } from "react-native";

import { Button } from "@/components/ui/button";

export function ButtonDemoExample() {
  return (
    <View className="flex-row flex-wrap items-center gap-2">
      <Button variant="outline">Button</Button>
      <Button accessibilityLabel="Submit" size="icon" variant="outline">
        <ArrowUpIcon />
      </Button>
    </View>
  );
}
