"use client";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
} from "@/components/ui/code-block";

export function CodeBlockFloatingActionsDemo() {
  return (
    <div className="w-full max-w-lg">
      <CodeBlock>
        <CodeBlockActions>
          <CodeBlockCopyButton value="npm i frakment" />
        </CodeBlockActions>
        <CodeBlockContent>npm i frakment</CodeBlockContent>
      </CodeBlock>
    </div>
  );
}
