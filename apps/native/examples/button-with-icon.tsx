import { GitBranch, GitFork } from "lucide-react-native";
import { View } from "react-native";

import { Button } from "@/components/ui/button";

export function ButtonWithIconExample() {
  return (
    <View className="flex-row gap-2">
      <Button variant="outline">
        <GitBranch /> New Branch
      </Button>
      <Button variant="outline">
        Fork
        <GitFork />
      </Button>
    </View>
  );
}
