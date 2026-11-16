"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabsDocs() {
  return (
    <Tabs className="mx-auto w-full max-w-sm" defaultValue="preview">
      <TabsList className="mx-auto">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent
        className="text-muted-foreground pt-3 text-sm"
        value="preview"
      >
        The component renders here.
      </TabsContent>
      <TabsContent className="text-muted-foreground pt-3 text-sm" value="code">
        Source code for this example.
      </TabsContent>
    </Tabs>
  );
}
