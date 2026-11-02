// Public AI helper entry. Re-exports the internal @shadcn/helpers replacement.
// Previously: export { createChat } from "@shadcn/helpers/ai-sdk";
// Now: local implementation in lib/ai/index.ts.

export { createChat, getMessageText } from "./ai/index";
export type { UIMessage } from "./ai/types";
