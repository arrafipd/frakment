"use client";

import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";

export function CodeBlockDocumentationDemo() {
  return (
    <CodeBlock className="mx-auto w-full max-w-md">
      <CodeBlockContent wrap>{"npx frakment add button"}</CodeBlockContent>
    </CodeBlock>
  );
}
