import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  CircleArrowUpIcon,
  GitBranch,
  GitFork,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
} from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ButtonVariant } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { Separator } from "@/components/ui/separator";
import { useThemeColors } from "@/lib/theme";

const variants: ButtonVariant[] = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
];

export default function Home() {
  const colors = useThemeColors();

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ backgroundColor: colors.background, flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ gap: 32, padding: 24 }}>
        <Text
          style={{
            color: colors.foreground,
            fontSize: 24,
            fontWeight: "700",
          }}
        >
          Frakment Native
        </Text>

        <View style={{ gap: 12 }}>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Variants
          </Text>
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </Button>
          ))}
        </View>

        <View style={{ gap: 12 }}>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Sizes
          </Text>
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: 8,
            }}
          >
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Icon only
          </Text>
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: 8,
            }}
          >
            <Button accessibilityLabel="Add" size="icon-xs" variant="outline">
              <PlusIcon color={colors.foreground} size={14} />
            </Button>
            <Button accessibilityLabel="Add" size="icon-sm" variant="outline">
              <PlusIcon color={colors.foreground} size={16} />
            </Button>
            <Button accessibilityLabel="Add" size="icon" variant="outline">
              <PlusIcon color={colors.foreground} size={18} />
            </Button>
            <Button accessibilityLabel="Add" size="icon-lg" variant="outline">
              <PlusIcon color={colors.foreground} size={20} />
            </Button>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            With icon
          </Text>
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <Button variant="outline">
              <GitBranch color={colors.foreground} size={16} /> New Branch
            </Button>
            <Button variant="outline">
              Fork
              <GitFork color={colors.foreground} size={16} />
            </Button>
            <Button accessibilityLabel="Submit" size="icon" variant="outline">
              <ArrowUpRightIcon color={colors.foreground} size={16} />
            </Button>
            <Button accessibilityLabel="Submit" size="icon" variant="outline">
              <CircleArrowUpIcon color={colors.foreground} size={16} />
            </Button>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Disabled
          </Text>
          <Button disabled>Disabled</Button>
        </View>

        <View style={{ gap: 12 }}>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Separator
          </Text>
          <Separator />
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: 12,
              height: 24,
            }}
          >
            <Text style={{ color: colors.foreground }}>Docs</Text>
            <Separator orientation="vertical" />
            <Text style={{ color: colors.foreground }}>Source</Text>
            <Separator orientation="vertical" />
            <Text style={{ color: colors.foreground }}>Design</Text>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Button Group
          </Text>
          <ButtonGroup>
            <ButtonGroup>
              <Button
                accessibilityLabel="Go Back"
                size="icon"
                variant="outline"
              >
                <ArrowLeftIcon color={colors.foreground} size={16} />
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button variant="outline">Archive</Button>
              <Button variant="outline">Report</Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button variant="outline">Snooze</Button>
              <Button
                accessibilityLabel="More Options"
                size="icon"
                variant="outline"
              >
                <MoreHorizontalIcon color={colors.foreground} size={16} />
              </Button>
            </ButtonGroup>
          </ButtonGroup>
          <ButtonGroup orientation="vertical">
            <Button accessibilityLabel="Add" size="icon" variant="outline">
              <PlusIcon color={colors.foreground} size={16} />
            </Button>
            <Button accessibilityLabel="Remove" size="icon" variant="outline">
              <MinusIcon color={colors.foreground} size={16} />
            </Button>
          </ButtonGroup>
        </View>

        <View style={{ gap: 12 }}>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Button Group with Separator
          </Text>
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

        <View style={{ gap: 12 }}>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Button Group Sizes
          </Text>
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
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline">Default</Button>
            <Button variant="outline">Button</Button>
            <Button variant="outline">Group</Button>
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
          </ButtonGroup>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
