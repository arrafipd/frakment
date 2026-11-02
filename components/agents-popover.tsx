"use client";

import { PlusIcon } from "@/lib/icons";
import { useState } from "react";

import { CodeBlockCommand } from "@/components/code-block-command";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const title = "For Agents";

const MCP = {
  bun: "bunx frakment-mcp",
  npm: "npx -y frakment-mcp",
  pnpm: "pnpm dlx frakment-mcp",
  yarn: "yarn dlx frakment-mcp",
};

const SKILL =
  "curl -s https://frakment.vercel.app/skills/frakment-usage/SKILL.md";

const Content = () => (
  <div className="flex w-full flex-col gap-3 md:min-w-[28rem]">
    <CodeBlockCommand
      __bun__={MCP.bun}
      __npm__={MCP.npm}
      __pnpm__={MCP.pnpm}
      __yarn__={MCP.yarn}
      copyEvent="copy_npm_command"
    />
    <CodeBlockCommand
      __bun__={SKILL}
      __npm__={SKILL}
      __pnpm__={SKILL}
      __yarn__={SKILL}
      copyEvent="copy_npm_command"
    />
  </div>
);

export const AgentsPopover = ({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const trigger = (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "gap-1.5 border-none px-2 opacity-70 hover:opacity-100 focus-visible:opacity-100 [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
    >
      <PlusIcon />
      <span className="hidden sm:inline">Agent</span>
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="rounded-t-[20px]" style={{ height: "40vh" }}>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4">
            <Content />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-fit max-w-[calc(100vw-2rem)] sm:max-w-fit">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Content />
      </DialogContent>
    </Dialog>
  );
};
