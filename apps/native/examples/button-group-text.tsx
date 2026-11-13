import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";

export function ButtonGroupTextExample() {
  return (
    <View>
      <ButtonGroup>
        <ButtonGroupText>Label</ButtonGroupText>
        <Button variant="outline">Action</Button>
      </ButtonGroup>
    </View>
  );
}
