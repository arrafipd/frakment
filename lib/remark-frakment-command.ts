// @ts-nocheck
// Remark plugin: transforms fenced `npx frakment ...` code blocks into
// <CodeBlockCommand /> JSX so the site renders package manager tabs.

const LANGUAGES = new Set(["bash", "sh", "shell", "zsh", "console", "npm"]);
const CMD = /^npx\s+frakment(?:@latest|@[0-9.]+)?\s+.+/u;

const isFrakmentCommand = (value) => {
  const firstLine = value.trim().split("\n")[0]?.trim();
  if (!firstLine) {
    return false;
  }
  return CMD.test(firstLine);
};

const buildVariants = (value) => {
  const firstLine = (value.trim().split("\n")[0] ?? "").trim();
  const strip = (prefix) => firstLine.replace(/^npx\s+/u, prefix);
  return {
    __bun__: strip("bunx "),
    __npm__: firstLine,
    __pnpm__: strip("pnpm dlx "),
    __yarn__: strip("yarn dlx "),
  };
};

const walk = (node, parent, cb) => {
  if (parent) {
    cb(node, parent);
  }
  if (node.children) {
    for (const c of node.children) {
      walk(c, node, cb);
    }
  }
};

export const remarkFrakmentCommand = () => (tree) => {
  walk(tree, null, (node, parent) => {
    if (node.type !== "pre") {
      return;
    }
    const children = node.children || [];
    const code = children.find((c) => c.type === "code");
    if (!code) {
      return;
    }
    if (code.lang && !LANGUAGES.has(code.lang)) {
      return;
    }
    if (typeof code.value !== "string") {
      return;
    }
    if (!isFrakmentCommand(code.value)) {
      return;
    }

    const variants = buildVariants(code.value);
    const idx = parent.children.indexOf(node);
    if (idx === -1) {
      return;
    }

    parent.children[idx] = {
      attributes: [
        { name: "__npm__", type: "mdxJsxAttribute", value: variants.__npm__ },
        { name: "__pnpm__", type: "mdxJsxAttribute", value: variants.__pnpm__ },
        { name: "__yarn__", type: "mdxJsxAttribute", value: variants.__yarn__ },
        { name: "__bun__", type: "mdxJsxAttribute", value: variants.__bun__ },
      ],
      children: [],
      name: "CodeBlockCommand",
      type: "mdxJsxFlowElement",
    };
  });
};
