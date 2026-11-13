import { ArrowUpIcon } from "lucide-react-native";
import { View } from "react-native";

import { Button } from "@/components/ui/button";

export function ButtonRoundedExample() {
  return (
    <View className="flex-row gap-2">
      <Button className="rounded-full">Get Started</Button>
      <Button
        accessibilityLabel="Submit"
        className="rounded-full"
        size="icon"
        variant="outline"
      >
        <ArrowUpIcon />
      </Button>
    </View>
  );
}
