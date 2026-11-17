"use client";

import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockLine,
} from "@/components/ui/code-block";

export function CodeBlockDiffDemo() {
  return (
    <div className="w-full max-w-lg">
      <CodeBlock>
        <CodeBlockContent>
          <CodeBlockLine>{"const config = {"}</CodeBlockLine>
          <CodeBlockLine variant="removed">{"  theme: 'light',"}</CodeBlockLine>
          <CodeBlockLine variant="added">{"  theme: 'system',"}</CodeBlockLine>
          <CodeBlockLine>{"}"}</CodeBlockLine>
        </CodeBlockContent>
      </CodeBlock>
    </div>
  );
}
