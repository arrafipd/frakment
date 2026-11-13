import { PlusIcon } from "lucide-react-native";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export function ButtonGroupSizeExample() {
  return (
    <View className="gap-8">
      <ButtonGroup>
        <Button size="sm" variant="outline">
          Small
        </Button>
        <Button size="sm" variant="outline">
          Button
        </Button>
        <Button size="sm" variant="outline">
          Group
        </Button>
        <Button accessibilityLabel="Add" size="icon-sm" variant="outline">
          <PlusIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Default</Button>
        <Button variant="outline">Button</Button>
        <Button variant="outline">Group</Button>
        <Button accessibilityLabel="Add" size="icon" variant="outline">
          <PlusIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button size="lg" variant="outline">
          Large
        </Button>
        <Button size="lg" variant="outline">
          Button
        </Button>
        <Button size="lg" variant="outline">
          Group
        </Button>
        <Button accessibilityLabel="Add" size="icon-lg" variant="outline">
          <PlusIcon />
        </Button>
      </ButtonGroup>
    </View>
  );
}
