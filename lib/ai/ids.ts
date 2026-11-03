// Frakment chat engine — deterministic ID generator (reserve/next semantics).

import type { ChatIdsOptions } from "./types";

export interface IdGenerator {
  nextMessageId: () => string;
  nextToolCallId: () => string;
  nextSourceId: () => string;
  nextApprovalId: () => string;
  reserveMessageId: (id: string) => void;
  reserveToolCallId: (id: string) => void;
  reserveSourceId: (id: string) => void;
  reserveApprovalId: (id: string) => void;
}

interface Counter {
  next: () => string;
  reserve: (id: string) => void;
}

function createCounter(prefix: string): Counter {
  const seen = new Set<string>();
  let max = 0;

  function reserve(id: string): void {
    seen.add(id);
    const expectedPrefix = `${prefix}-`;
    if (!id.startsWith(expectedPrefix)) {
      return;
    }
    const suffix = id.slice(expectedPrefix.length);
    if (!/^\d+$/.test(suffix)) {
      return;
    }
    const numeric = Number(suffix);
    if (Number.isSafeInteger(numeric)) {
      max = Math.max(max, numeric);
    }
  }

  function next(): string {
    let candidate: string;
    do {
      max += 1;
      candidate = `${prefix}-${max}`;
    } while (seen.has(candidate));
    reserve(candidate);
    return candidate;
  }

  return { next, reserve };
}

export function createIdGenerator(options: ChatIdsOptions = {}): IdGenerator {
  const messageCounter = createCounter(options.messageIdPrefix ?? "msg");
  const toolCallCounter = createCounter(options.toolCallIdPrefix ?? "call");
  const sourceCounter = createCounter(options.sourceIdPrefix ?? "source");
  const approvalCounter = createCounter(options.approvalIdPrefix ?? "approval");

  return {
    nextMessageId: () => messageCounter.next(),
    nextToolCallId: () => toolCallCounter.next(),
    nextSourceId: () => sourceCounter.next(),
    nextApprovalId: () => approvalCounter.next(),
    reserveMessageId: (id) => messageCounter.reserve(id),
    reserveToolCallId: (id) => toolCallCounter.reserve(id),
    reserveSourceId: (id) => sourceCounter.reserve(id),
    reserveApprovalId: (id) => approvalCounter.reserve(id),
  };
}
