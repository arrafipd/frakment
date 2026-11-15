"use client";

import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";

export function CodeBlockSizeDemo() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs font-medium">
          size="default"
        </span>
        <CodeBlock>
          <CodeBlockContent>npx frakment add button</CodeBlockContent>
        </CodeBlock>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs font-medium">
          size="sm"
        </span>
        <CodeBlock size="sm">
          <CodeBlockContent>npx frakment add button</CodeBlockContent>
        </CodeBlock>
      </div>
    </div>
  );
}
