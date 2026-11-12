"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabsDisabled() {
  return (
    <Tabs defaultValue="home">
      <TabsList>
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger disabled value="settings">
          Disabled
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
