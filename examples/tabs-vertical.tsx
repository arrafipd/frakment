"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabsVertical() {
  return (
    <Tabs className="w-[400px]" defaultValue="account" orientation="vertical">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent className="text-muted-foreground text-sm" value="account">
        Update your display name and email address.
      </TabsContent>
      <TabsContent className="text-muted-foreground text-sm" value="password">
        Change your password and enable two-factor authentication.
      </TabsContent>
      <TabsContent
        className="text-muted-foreground text-sm"
        value="notifications"
      >
        Control which emails and push notifications you receive.
      </TabsContent>
    </Tabs>
  );
}
