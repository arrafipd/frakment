import { ArrowUpRightIcon } from "lucide-react-native";
import { View } from "react-native";

import { Button } from "@/components/ui/button";

export function ButtonSizeExample() {
  return (
    <View className="gap-8">
      <View className="flex-row items-start gap-2">
        <Button size="xs" variant="outline">
          Extra Small
        </Button>
        <Button accessibilityLabel="Submit" size="icon-xs" variant="outline">
          <ArrowUpRightIcon />
        </Button>
      </View>
      <View className="flex-row items-start gap-2">
        <Button size="sm" variant="outline">
          Small
        </Button>
        <Button accessibilityLabel="Submit" size="icon-sm" variant="outline">
          <ArrowUpRightIcon />
        </Button>
      </View>
      <View className="flex-row items-start gap-2">
        <Button variant="outline">Default</Button>
        <Button accessibilityLabel="Submit" size="icon" variant="outline">
          <ArrowUpRightIcon />
        </Button>
      </View>
      <View className="flex-row items-start gap-2">
        <Button size="lg" variant="outline">
          Large
        </Button>
        <Button accessibilityLabel="Submit" size="icon-lg" variant="outline">
          <ArrowUpRightIcon />
        </Button>
      </View>
    </View>
  );
}
