"use client";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block";

export function CodeBlockHeaderDemo() {
  return (
    <div className="w-full max-w-lg">
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>Terminal</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton value="npx frakment add button" />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent>npx frakment add button</CodeBlockContent>
      </CodeBlock>
    </div>
  );
}
