import { MinusIcon, PlusIcon } from "lucide-react-native";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export function ButtonGroupOrientationExample() {
  return (
    <View>
      <ButtonGroup orientation="vertical">
        <Button accessibilityLabel="Add" size="icon" variant="outline">
          <PlusIcon />
        </Button>
        <Button accessibilityLabel="Remove" size="icon" variant="outline">
          <MinusIcon />
        </Button>
      </ButtonGroup>
    </View>
  );
}
