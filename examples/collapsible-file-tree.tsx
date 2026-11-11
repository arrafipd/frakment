import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type FileTreeItem = { name: string } | { name: string; items: FileTreeItem[] };

const TREE: FileTreeItem[] = [
  {
    items: [
      {
        items: [
          { name: "button.tsx" },
          { name: "card.tsx" },
          { name: "input.tsx" },
        ],
        name: "ui",
      },
      { name: "login-form.tsx" },
    ],
    name: "components",
  },
  {
    items: [{ name: "utils.ts" }, { name: "api.ts" }],
    name: "lib",
  },
  { name: "app.tsx" },
  { name: "package.json" },
];

function Item({ item }: { item: FileTreeItem }) {
  if ("items" in item) {
    return (
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button
            className="group w-full justify-start"
            size="sm"
            variant="ghost"
          >
            <ChevronRightIcon className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
            <FolderIcon />
            {item.name}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 ml-5">
          <div className="flex flex-col gap-1">
            {item.items.map((child) => (
              <Item item={child} key={child.name} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }
  return (
    <Button
      className="text-foreground w-full justify-start gap-2"
      size="sm"
      variant="link"
    >
      <FileIcon />
      <span>{item.name}</span>
    </Button>
  );
}

export function CollapsibleFileTree() {
  return (
    <Card className="mx-auto w-full max-w-[16rem] gap-2" size="sm">
      <CardHeader>
        <p className="text-sm font-medium">Explorer</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          {TREE.map((item) => (
            <Item item={item} key={item.name} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
