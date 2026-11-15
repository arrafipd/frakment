import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CardProjectList() {
  return (
    <div className="mx-auto w-full max-w-sm space-y-3">
      <Card>
        <CardHeader>
          <CardTitle>frakment/ui</CardTitle>
          <CardDescription>Primitives for product surfaces.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            42 components. Radix-based. Copy-paste first.
          </p>
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="outline">
            View
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>frakment/ai</CardTitle>
          <CardDescription>
            Chat, agent, and reasoning primitives.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Message, Bubble, Trace, Attachment.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="outline">
            View
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
