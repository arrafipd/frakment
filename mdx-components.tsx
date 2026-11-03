import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { FrakmentMark } from "@/components/brand";
import { BrandColorSwatch } from "@/components/brand-color-swatch";
import { Callout } from "@/components/callout";
import { ChangelogList } from "@/components/changelog-list";
import { CodeBlockCommand } from "@/components/code-block-command";
import { CodeCollapsibleWrapper } from "@/components/code-collapsible-wrapper";
import { CodeTabs } from "@/components/code-tabs";
import { ComponentPreview } from "@/components/component-preview";
import { ComponentSource } from "@/components/component-source";
import { ComponentsList } from "@/components/components-list";
import { CopyButton } from "@/components/copy-button";
import { FileTree, FileTreeFile, FileTreeFolder } from "@/components/file-tree";
import { getIconForLanguageExtension } from "@/components/icons";
import { IntroFeatureCard } from "@/components/intro-feature-card";
import { PropsTable } from "@/components/props-table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger as AccordionTriggerBase,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IconComponent } from "@/lib/icons";
import { cn } from "@/lib/utils";

const LANGUAGE_TITLES: Record<string, string> = {
  astro: "astro",
  css: "css",
  diff: "diff",
  html: "html",
  javascript: "javascript",
  js: "js",
  json: "json",
  jsonc: "json",
  jsx: "jsx",
  md: "md",
  mdx: "mdx",
  sass: "sass",
  scss: "scss",
  svg: "svg",
  ts: "ts",
  tsx: "tsx",
  typescript: "typescript",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
};
export const mdxComponents = {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger: (
    props: React.ComponentProps<typeof AccordionTriggerBase>
  ) => <AccordionTriggerBase {...props} />,
  Alert,
  AlertDescription,
  AlertTitle,
  AspectRatio,
  a: ({ className, children, ...props }: React.ComponentProps<"a">) => (
    <a
      className={cn("font-medium underline underline-offset-4", className)}
      {...props}
    >
      {children}
    </a>
  ),
  BrandColorSwatch,
  Button,
  blockquote: ({ className, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote
      className={cn("border-border mt-6 border-l-4 pl-6 italic", className)}
      {...props}
    />
  ),
  Callout,
  ChangelogList,
  CodeCollapsibleWrapper,
  CodeTabs,
  ComponentPreview,
  ComponentSource,
  ComponentsList,
  code: ({
    className,
    __raw__,
    __src__,
    __npm__,
    __yarn__,
    __pnpm__,
    __bun__,
    ...props
  }: React.ComponentProps<"code"> & {
    __raw__?: string;
    __src__?: string;
    __npm__?: string;
    __yarn__?: string;
    __pnpm__?: string;
    __bun__?: string;
  }) => {
    // Inline Code.
    if (typeof props.children === "string") {
      return (
        <code
          className={cn(
            "bg-muted relative rounded-[3px] px-[5px] py-px font-mono text-[0.85em] break-words outline-none",
            className
          )}
          {...props}
        />
      );
    }

    // npm command.
    const isNpmCommand = __npm__ && __yarn__ && __pnpm__ && __bun__;
    if (isNpmCommand) {
      return (
        <CodeBlockCommand
          __bun__={__bun__}
          __npm__={__npm__}
          __pnpm__={__pnpm__}
          __yarn__={__yarn__}
        />
      );
    }

    // Default codeblock.
    return (
      <>
        {__raw__ && (
          <CopyButton event="copy_usage_code" src={__src__} value={__raw__} />
        )}
        <code {...props} />
      </>
    );
  },
  FeatureCard: ({
    icon: Icon,
    title,
    description,
    className,
  }: React.ComponentProps<typeof Card> & {
    icon: IconComponent;
    title: string;
    description: string;
  }) => (
    <Card
      className={cn(
        "flex flex-col gap-2 rounded-xl py-4 shadow-none",
        className
      )}
    >
      <CardHeader className="flex items-center gap-2 px-4">
        <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
          <Icon className="size-4" />
        </div>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground px-4 text-sm">
        {description}
      </CardContent>
    </Card>
  ),
  FileTree,
  FileTreeFile,
  FileTreeFolder,
  FrakmentMark,
  figcaption: ({
    className,
    children,
    ...props
  }: React.ComponentProps<"figcaption">) => {
    const iconExtension =
      "data-language" in props && typeof props["data-language"] === "string"
        ? getIconForLanguageExtension(props["data-language"])
        : null;

    return (
      <figcaption
        className={cn(
          "text-code-foreground [&_svg]:text-code-foreground flex items-center gap-2 [&_svg]:size-4 [&_svg]:opacity-70",
          className
        )}
        {...props}
      >
        {iconExtension}
        {children}
      </figcaption>
    );
  },
  figure: ({
    className,
    children,
    ...props
  }: React.ComponentProps<"figure">) => {
    const childArray = React.Children.toArray(children);
    const hasCaption = childArray.some((c) => {
      if (!React.isValidElement(c)) {
        return false;
      }
      const p = c.props as Record<string, unknown>;
      return (
        c.type === "figcaption" ||
        p?.["data-rehype-pretty-code-title"] !== undefined
      );
    });

    if (hasCaption) {
      return (
        <figure className={cn(className)} {...props}>
          {children}
        </figure>
      );
    }

    let lang: string | undefined;
    const findLang = (node: React.ReactNode): void => {
      if (!React.isValidElement(node) || lang) {
        return;
      }
      const p = node.props as Record<string, unknown>;
      if (typeof p?.["data-language"] === "string") {
        lang = p["data-language"] as string;
        return;
      }
      React.Children.forEach(p?.children as React.ReactNode, findLang);
    };
    for (const child of childArray) {
      findLang(child);
    }

    const title = lang ? LANGUAGE_TITLES[lang] : undefined;
    if (!(lang && title)) {
      return (
        <figure className={cn(className)} {...props}>
          {children}
        </figure>
      );
    }

    return (
      <figure className={cn(className)} {...props}>
        <figcaption
          className="text-code-foreground [&_svg]:text-code-foreground flex items-center gap-2 [&_svg]:size-4 [&_svg]:opacity-70"
          data-language={lang}
          data-rehype-pretty-code-title
        >
          {getIconForLanguageExtension(lang)}
          {title}
        </figcaption>
        {children}
      </figure>
    );
  },
  h1: ({ className, children, ...props }: React.ComponentProps<"h1">) => (
    <h1
      className={cn(
        "font-heading mt-2 scroll-m-28 text-3xl font-bold tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ className, children, ...props }: React.ComponentProps<"h2">) => (
    <h2
      className={cn(
        "[&+]*:[code]:text-xl mt-10 scroll-m-28 font-heading text-xl font-medium tracking-tight first:mt-0 lg:mt-12 [&+.steps]:mt-0! [&+.steps>h3]:mt-4! [&+h3]:mt-6![&+p]:mt-4!",
        className
      )}
      id={children
        ?.toString()
        .replaceAll(" ", "-")
        .replaceAll("'", "")
        .replaceAll("?", "")
        .toLowerCase()}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ className, children, ...props }: React.ComponentProps<"h3">) => (
    <h3
      className={cn(
        "font-heading mt-12 scroll-m-28 text-lg font-medium tracking-tight [&+p]:mt-4! *:[code]:text-xl",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ className, children, ...props }: React.ComponentProps<"h4">) => (
    <h4
      className={cn(
        "font-heading mt-8 scroll-m-28 text-base font-medium tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ className, children, ...props }: React.ComponentProps<"h5">) => (
    <h5
      className={cn(
        "mt-8 scroll-m-28 text-base font-medium tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ className, children, ...props }: React.ComponentProps<"h6">) => (
    <h6
      className={cn(
        "mt-8 scroll-m-28 text-base font-medium tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h6>
  ),
  hr: ({ ...props }: React.ComponentProps<"hr">) => (
    <hr className="my-4 md:my-8" {...props} />
  ),
  Image: ({
    src,
    className,
    width,
    height,
    alt,
    ...props
  }: React.ComponentProps<"img">) => (
    <Image
      alt={alt || ""}
      className={cn("mt-6 rounded-md border", className)}
      height={Number(height)}
      src={src?.toString() || ""}
      width={Number(width)}
      {...props}
    />
  ),
  IntroFeatureCard,
  img: ({ className, alt, ...props }: React.ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} className={cn("rounded-md", className)} {...props} />
  ),
  Kbd,
  Link: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn("font-medium underline underline-offset-4", className)}
      {...props}
    />
  ),
  LinkedCard: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn(
        "bg-surface text-surface-foreground hover:bg-surface/80 flex w-full flex-col items-center rounded-xl p-6 transition-colors sm:p-10",
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.ComponentProps<"li">) => (
    <li className={cn("mt-2", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.ComponentProps<"ol">) => (
    <ol className={cn("my-6 ml-6 list-decimal", className)} {...props} />
  ),
  PropsTable,
  p: ({ className, ...props }: React.ComponentProps<"p">) => (
    <p
      className={cn(
        "text-base leading-relaxed [&:not(:first-child)]:mt-6",
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, children, ...props }: React.ComponentProps<"pre">) => (
    <pre
      className={cn(
        "no-scrollbar min-w-0 overflow-x-auto px-4 py-3.5 outline-none has-data-highlighted-line:px-0 has-[[data-line-numbers]]:px-0 has-[[data-slot=tabs]]:p-0",
        className
      )}
      {...props}
    >
      {children}
    </pre>
  ),
  Step: (props: React.ComponentProps<"h3">) => <h3 {...props} />,
  Steps: ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
      className={cn(
        "steps [&>h3]:step mb-12 [counter-reset:step] md:ml-4 md:border-l md:pl-8",
        className
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className={cn("font-medium", className)} {...props} />
  ),
  Tab: ({ className, ...props }: React.ComponentProps<"div">) => (
    <div className={cn(className)} {...props} />
  ),
  Tabs: ({ className, ...props }: React.ComponentProps<typeof Tabs>) => (
    <Tabs className={cn("relative mt-6 w-full", className)} {...props} />
  ),
  TabsContent: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsContent>) => (
    <TabsContent
      className={cn(
        "relative [&_h3.font-heading]:text-base [&_h3.font-heading]:font-medium [&>.steps]:mt-6 *:[figure]:first:mt-0",
        className
      )}
      {...props}
    />
  ),
  TabsList: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsList>) => (
    <TabsList
      className={cn(
        "justify-start gap-4 rounded-none bg-transparent px-0",
        className
      )}
      {...props}
    />
  ),
  TabsTrigger: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsTrigger>) => (
    <TabsTrigger
      className={cn(
        "text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-primary dark:data-[state=active]:border-primary hover:text-primary rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 text-base data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent",
        className
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }: React.ComponentProps<"table">) => (
    <div className="my-6 w-full overflow-x-auto rounded-lg border">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  ),
  tbody: ({ className, ...props }: React.ComponentProps<"tbody">) => (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  ),
  td: ({ className, ...props }: React.ComponentProps<"td">) => (
    <td
      className={cn(
        "px-4 py-3 align-middle [[align=center]]:text-center [[align=right]]:text-right",
        className
      )}
      {...props}
    />
  ),
  th: ({ className, ...props }: React.ComponentProps<"th">) => (
    <th
      className={cn(
        "text-muted-foreground h-10 px-4 text-left align-middle text-xs font-semibold tracking-wide uppercase [[align=center]]:text-center [[align=right]]:text-right",
        className
      )}
      {...props}
    />
  ),
  thead: ({ className, ...props }: React.ComponentProps<"thead">) => (
    <thead className={cn("bg-muted/50 border-b", className)} {...props} />
  ),
  tr: ({ className, ...props }: React.ComponentProps<"tr">) => (
    <tr
      className={cn("hover:bg-muted/30 border-b transition-colors", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.ComponentProps<"ul">) => (
    <ul className={cn("my-6 ml-6 list-disc", className)} {...props} />
  ),
};
