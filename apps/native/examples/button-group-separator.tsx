import { View } from "react-native";

import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";

export function ButtonGroupSeparatorExample() {
  return (
    <View>
      <ButtonGroup>
        <Button size="sm" variant="secondary">
          Copy
        </Button>
        <ButtonGroupSeparator />
        <Button size="sm" variant="secondary">
          Paste
        </Button>
      </ButtonGroup>
    </View>
  );
}
