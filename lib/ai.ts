// Public AI helper entry. Re-exports the internal deterministic chat engine.
// Previously: re-exported from an external helper library. Now local in lib/ai/index.ts.
// Now: local implementation in lib/ai/index.ts.

export { createChat, getMessageText } from "./ai/index";
export type { UIMessage } from "./ai/types";
