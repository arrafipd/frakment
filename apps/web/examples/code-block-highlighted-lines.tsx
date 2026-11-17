"use client";

import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockLine,
} from "@/components/ui/code-block";

export function CodeBlockHighlightedLinesDemo() {
  return (
    <div className="w-full max-w-lg">
      <CodeBlock>
        <CodeBlockContent>
          <CodeBlockLine>{"const config = {"}</CodeBlockLine>
          <CodeBlockLine>{"  theme: 'system',"}</CodeBlockLine>
          <CodeBlockLine variant="highlighted">
            {"    primary: 'oklch(0.6 0.2 250)',"}
          </CodeBlockLine>
          <CodeBlockLine>{"  radius: 0.5,"}</CodeBlockLine>
          <CodeBlockLine>{"}"}</CodeBlockLine>
        </CodeBlockContent>
      </CodeBlock>
    </div>
  );
}
