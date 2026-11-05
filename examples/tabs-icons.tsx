"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeIcon, FileCodeIcon } from "@/lib/icons";

export function TabsIcons() {
  return (
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="preview">
          <CodeIcon />
          Preview
        </TabsTrigger>
        <TabsTrigger value="code">
          <FileCodeIcon />
          Code
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
