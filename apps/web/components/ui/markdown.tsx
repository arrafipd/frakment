import { marked } from "marked";
import * as React from "react";
import { memo, useId, useMemo } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "./code-block";

export interface MarkdownProps {
  children: string;
  className?: string;
  components?: Partial<Components>;
  id?: string;
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

function extractLanguage(className?: string): string {
  if (!className) {
    return "plaintext";
  }
  const match = className.match(/language-(\w+)/u);
  return match ? match[1] : "plaintext";
}

function extractTextContent(node: React.ReactNode): string {
  if (typeof node === "string") {
    return node;
  }
  if (typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractTextContent).join("");
  }
  if (React.isValidElement(node)) {
    return extractTextContent(
      (node.props as { children?: React.ReactNode }).children
    );
  }
  return "";
}

const INITIAL_COMPONENTS: Partial<Components> = {
  a: function Anchor({ children, ...props }) {
    return (
      <a
        className="text-primary underline underline-offset-4 hover:opacity-80"
        {...props}
      >
        {children}
      </a>
    );
  },
  blockquote: function Blockquote({ children, ...props }) {
    return (
      <blockquote
        className="border-border text-muted-foreground mb-3 border-l-2 pl-4 italic last:mb-0"
        {...props}
      >
        {children}
      </blockquote>
    );
  },
  code: function CodeComponent({ className, children, ...props }) {
    const isInline =
      !props.node?.position?.start.line ||
      props.node?.position?.start.line === props.node?.position?.end.line;

    if (isInline) {
      return (
        <span
          className={cn(
            "bg-muted text-foreground rounded-sm px-1.5 py-0.5 font-mono text-[0.875em]",
            className
          )}
          {...props}
        >
          {children}
        </span>
      );
    }

    // Block code: rehype-pretty-code already highlighted.
    // Let pre handler wrap it in CodeBlock with header + copy.
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  h1: function H1({ children, ...props }) {
    return (
      <h1 className="mt-4 mb-2 text-lg font-semibold first:mt-0" {...props}>
        {children}
      </h1>
    );
  },
  h2: function H2({ children, ...props }) {
    return (
      <h2 className="mt-4 mb-2 text-base font-semibold first:mt-0" {...props}>
        {children}
      </h2>
    );
  },
  h3: function H3({ children, ...props }) {
    return (
      <h3 className="mt-3 mb-1.5 text-sm font-semibold first:mt-0" {...props}>
        {children}
      </h3>
    );
  },
  li: function ListItem({ children, ...props }) {
    return (
      <li className="leading-relaxed" {...props}>
        {children}
      </li>
    );
  },
  ol: function OrderedList({ children, ...props }) {
    return (
      <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0" {...props}>
        {children}
      </ol>
    );
  },
  p: function ParagraphComponent({ children, ...props }) {
    return (
      <p className="mb-3 leading-relaxed last:mb-0" {...props}>
        {children}
      </p>
    );
  },
  pre: function PreComponent({ children }) {
    const first = React.Children.toArray(children)[0];

    if (!React.isValidElement(first)) {
      return (
        <pre className="border-border bg-code my-3 overflow-x-auto rounded-xl border p-4 text-sm">
          {children}
        </pre>
      );
    }

    const codeProps = first.props as {
      className?: string;
      children?: React.ReactNode;
      "data-language"?: string;
    };

    const language =
      codeProps["data-language"] ||
      extractLanguage(codeProps.className) ||
      "plaintext";
    const rawText = extractTextContent(codeProps.children);

    return (
      <CodeBlock className="my-3">
        <CodeBlockHeader>
          <CodeBlockTitle>{language}</CodeBlockTitle>
          <CodeBlockActions className="opacity-100!">
            <CodeBlockCopyButton value={rawText} />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent>
          <code className={codeProps.className}>{codeProps.children}</code>
        </CodeBlockContent>
      </CodeBlock>
    );
  },
  strong: function Strong({ children, ...props }) {
    return (
      <strong className="font-semibold" {...props}>
        {children}
      </strong>
    );
  },
  ul: function UnorderedList({ children, ...props }) {
    return (
      <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0" {...props}>
        {children}
      </ul>
    );
  },
};

const MemoizedMarkdownBlock = memo(
  function MarkdownBlock({
    content,
    components = INITIAL_COMPONENTS,
  }: {
    content: string;
    components?: Partial<Components>;
  }) {
    return (
      <ReactMarkdown
        components={components}
        rehypePlugins={[rehypeHighlight]}
        remarkPlugins={[remarkGfm, remarkBreaks]}
      >
        {content}
      </ReactMarkdown>
    );
  },
  function propsAreEqual(prevProps, nextProps) {
    return prevProps.content === nextProps.content;
  }
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

function MarkdownComponent({
  children,
  id,
  className,
  components = INITIAL_COMPONENTS,
}: MarkdownProps) {
  const generatedId = useId();
  const blockId = id ?? generatedId;
  const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children]);

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <MemoizedMarkdownBlock
          components={components}
          content={block}
          key={`${blockId}-block-${index}`}
        />
      ))}
    </div>
  );
}

const Markdown = memo(MarkdownComponent);
Markdown.displayName = "Markdown";

export { Markdown };
