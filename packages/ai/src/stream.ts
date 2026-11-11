// Frakment chat engine — ReadableStream<UIMessageChunk> from ChatEventEnvelope[].

import type { ChatEventEnvelope, UIMessageChunk } from "./types";
import { abortableSleep } from "./utils";

export function streamFromEnvelope(
  envelope: readonly ChatEventEnvelope[],
  encodeChunk: (
    chunk: UIMessageChunk
  ) => UIMessageChunk | UIMessageChunk[] | null,
  abortSignal?: AbortSignal
): ReadableStream<UIMessageChunk> {
  let cancelled = false;

  return new ReadableStream<UIMessageChunk>({
    cancel() {
      cancelled = true;
    },
    async start(controller) {
      let aborted = abortSignal?.aborted ?? false;
      const onAbort = () => {
        aborted = true;
      };
      abortSignal?.addEventListener("abort", onAbort);

      function enqueue(chunk: UIMessageChunk): void {
        const encoded = encodeChunk(chunk);
        if (encoded === null) {
          return;
        }
        if (Array.isArray(encoded)) {
          for (const c of encoded) {
            controller.enqueue(c);
          }
          return;
        }
        controller.enqueue(encoded);
      }

      try {
        function finalize(): void {
          if (aborted) {
            enqueue({ reason: "aborted", type: "abort" } as UIMessageChunk);
          }
          controller.close();
        }

        for (const item of envelope) {
          if (cancelled) {
            return;
          }
          if (aborted) {
            finalize();
            return;
          }
          if (item.kind === "sleep") {
            await abortableSleep(item.delayMs, abortSignal);
            if (aborted) {
              finalize();
              return;
            }
            continue;
          }
          if (item.kind === "close") {
            controller.close();
            return;
          }
          enqueue(item.chunk);
        }
        if (!cancelled) {
          controller.close();
        }
      } finally {
        abortSignal?.removeEventListener("abort", onAbort);
      }
    },
  });
}
