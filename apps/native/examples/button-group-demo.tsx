import { ArrowLeftIcon } from "lucide-react-native";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export function ButtonGroupDemoExample() {
  return (
    <View>
      <ButtonGroup>
        <ButtonGroup>
          <Button accessibilityLabel="Go Back" size="icon" variant="outline">
            <ArrowLeftIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline">Archive</Button>
          <Button variant="outline">Report</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline">Snooze</Button>
        </ButtonGroup>
      </ButtonGroup>
    </View>
  );
}
