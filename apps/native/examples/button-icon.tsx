import { CircleArrowUpIcon } from "lucide-react-native";
import { View } from "react-native";

import { Button } from "@/components/ui/button";

export function ButtonIconExample() {
  return (
    <View>
      <Button accessibilityLabel="Submit" size="icon" variant="outline">
        <CircleArrowUpIcon />
      </Button>
    </View>
  );
}
