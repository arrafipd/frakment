"use client";

import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";

export function CodeBlockWrapDemo() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-4 p-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs font-medium">
          default (scroll)
        </span>
        <CodeBlock>
          <CodeBlockContent>
            Error: Failed to resolve module from /app/page.tsx
          </CodeBlockContent>
        </CodeBlock>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs font-medium">wrap</span>
        <CodeBlock>
          <CodeBlockContent wrap>
            Error: Failed to resolve module from /app/page.tsx
          </CodeBlockContent>
        </CodeBlock>
      </div>
    </div>
  );
}
