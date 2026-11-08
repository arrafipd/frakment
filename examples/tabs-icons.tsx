"use client";

import { CodeIcon, FileCodeIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
