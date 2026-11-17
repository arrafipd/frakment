"use client";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block";

export function CodeBlockActionsDemo() {
  return (
    <div className="w-full max-w-lg">
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>install.sh</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton value="pnpm add frakment" />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent>pnpm add frakment</CodeBlockContent>
      </CodeBlock>
    </div>
  );
}
