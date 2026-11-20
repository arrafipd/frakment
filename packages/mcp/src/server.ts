export interface RegistryComponent {
  description?: string;
  name: string;
  title?: string;
}

export interface RegistryFile {
  content?: string;
  encoding?: "base64";
  path: string;
}

export interface RegistryComponentPayload {
  dependencies?: string[];
  description?: string;
  files?: RegistryFile[];
  name: string;
  registryDependencies?: string[];
}

export interface RegistryIndex {
  components?: RegistryComponent[];
}

export interface Scenario {
  components: string[];
  description: string;
  install: string;
  note: string;
}

export const scenarios: Record<string, Scenario> = {
  "agent-timeline": {
    components: ["trace", "code-block"],
    description: "Agent activity view with trace steps and code output",
    install: "trace code-block",
    note: "trace pulls collapsible and shimmer; code-block pulls button.",
  },
  chat: {
    components: ["message", "avatar"],
    description: "Chat interface with auto-scroll and animated turns",
    install: "message",
    note: "message includes the message, bubble, scroll, and animated message primitives. Add avatar separately.",
  },
  "code-output": {
    components: ["code-block"],
    description: "Syntax-highlighted code with copy actions and line diffs",
    install: "code-block",
    note: "code-block pulls button and icons.",
  },
  "empty-state": {
    components: ["empty", "button"],
    description: "Zero-data placeholder with optional call-to-action",
    install: "empty button",
    note: "empty is standalone.",
  },
  "login-form": {
    components: ["field", "label", "input", "button", "checkbox"],
    description: "Accessible login form with remember-me toggle",
    install: "field input button checkbox",
    note: "field pulls label and separator; the CLI resolves dependencies for all components.",
  },
  "search-input": {
    components: ["input-group", "input", "button", "spinner"],
    description: "Search input with inline button and loading state",
    install: "input-group spinner",
    note: "input-group pulls input, textarea, and button.",
  },
  "settings-panel": {
    components: ["field", "switch", "toggle-group", "separator"],
    description: "Settings panel with boolean toggles and grouped options",
    install: "field switch toggle-group separator",
    note: "field pulls label and separator; toggle-group pulls toggle.",
  },
};

export const getScenario = (name: string): Scenario | undefined =>
  scenarios[name];

export const labelRegistryFile = (file: RegistryFile): string =>
  `--- ${file.path}${file.encoding ? ` (encoding: ${file.encoding})` : ""} ---\n${file.content || ""}`;

export const getRegistryIndex = (value: unknown): RegistryIndex => {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as RegistryIndex;
};

export const getRegistryComponentPayload = (
  value: unknown
): RegistryComponentPayload => {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid registry component payload");
  }
  return value as RegistryComponentPayload;
};
