import { PlusIcon } from "lucide-react-native";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";

export function ButtonGroupSplitExample() {
  return (
    <View>
      <ButtonGroup>
        <Button variant="secondary">Button</Button>
        <ButtonGroupSeparator />
        <Button accessibilityLabel="Add" size="icon" variant="secondary">
          <PlusIcon />
        </Button>
      </ButtonGroup>
    </View>
  );
}
