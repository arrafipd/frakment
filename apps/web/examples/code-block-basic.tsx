"use client";

import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";

export function CodeBlockBasicDemo() {
  return (
    <div className="w-full max-w-lg">
      <CodeBlock>
        <CodeBlockContent>npm install frakment</CodeBlockContent>
      </CodeBlock>
    </div>
  );
}
