"use client";

import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";

export function CodeBlockDestructiveDemo() {
  return (
    <div className="w-full max-w-lg">
      <CodeBlock variant="destructive">
        <CodeBlockContent>
          {"Error: Failed to resolve module '@/components/ui/code-block'"}
        </CodeBlockContent>
      </CodeBlock>
    </div>
  );
}
