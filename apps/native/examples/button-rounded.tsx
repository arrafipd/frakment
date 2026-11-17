import { ArrowUpIcon } from "lucide-react-native";
import { View } from "react-native";

import { Button } from "@/components/ui/button";

export function ButtonRoundedExample() {
  return (
    <View className="flex-row gap-2">
      <Button style={{ borderRadius: 9999 }}>Get Started</Button>
      <Button
        accessibilityLabel="Submit"
        size="icon"
        style={{ borderRadius: 9999 }}
        variant="outline"
      >
        <ArrowUpIcon />
      </Button>
    </View>
  );
}
