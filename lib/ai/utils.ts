// Frakment chat engine — internal utility helpers.
// assertNever, abortableSleep, deepClone, splitWords, stripDataPrefix, devWarn.

export function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
}

export function abortableSleep(
  delayMs: number,
  abortSignal?: AbortSignal
): Promise<void> {
  if (abortSignal?.aborted) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    const timeout = setTimeout(onAbort, delayMs);
    function onAbort(): void {
      clearTimeout(timeout);
      abortSignal?.removeEventListener("abort", onAbort);
      resolve();
    }
    abortSignal?.addEventListener("abort", onAbort, { once: true });
  });
}

export function deepClone<T>(value: T): T {
  return structuredClone(value);
}

const WORD_REGEX = /\S+\s*/g;

export function splitWords(text: string): string[] {
  return text.match(WORD_REGEX) ?? [text];
}

export function stripDataPrefix(type: string): string {
  return type.slice("data-".length);
}

export function devWarn(message: string): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[helpers] ${message}`);
  }
}
