// Port of @shadcn/helpers payload factory (chunk-ZEGKA56A.js `$()` function).
// Reference: file, reasoningFile, sourceUrl, sourceDocument, custom with defaults.

import type { IdGenerator } from "./ids";
import type {
  FilePayload,
  ReasoningFilePayload,
  SourceDocumentPayload,
  SourceUrlPayload,
  JsonRecord,
} from "./types";
import { deepClone } from "./utils";

export interface PayloadFactory {
  file: (overrides?: Partial<FilePayload>) => FilePayload;
  reasoningFile: (
    overrides?: Partial<ReasoningFilePayload>
  ) => ReasoningFilePayload;
  sourceUrl: (overrides?: Partial<SourceUrlPayload>) => SourceUrlPayload;
  sourceDocument: (
    overrides?: Partial<SourceDocumentPayload>
  ) => SourceDocumentPayload;
  custom: (
    kind?: string,
    options?: JsonRecord
  ) => { kind: string } & JsonRecord;
}

export function createPayloadFactory(ids: IdGenerator): PayloadFactory {
  function sourceId(id: string | undefined): string {
    if (id !== undefined) {
      ids.reserveSourceId(id);
      return id;
    }
    return ids.nextSourceId();
  }

  return {
    file(overrides = {}) {
      return {
        mediaType: "image/png",
        filename: "receipt.png",
        url: "https://example.com/receipt.png",
        ...deepClone(overrides),
      };
    },

    reasoningFile(overrides = {}) {
      return {
        mediaType: "text/plain",
        url: "data:text/plain;base64,cmVhc29uaW5n",
        ...deepClone(overrides),
      };
    },

    sourceUrl(overrides = {}) {
      const cloned = deepClone(overrides);
      return {
        sourceId: sourceId(cloned.sourceId),
        url: cloned.url ?? "https://ai-sdk.dev/docs",
        title: cloned.title ?? "AI SDK Docs",
        providerMetadata: cloned.providerMetadata,
      };
    },

    sourceDocument(overrides = {}) {
      const cloned = deepClone(overrides);
      return {
        sourceId: sourceId(cloned.sourceId),
        mediaType: cloned.mediaType ?? "text/markdown",
        title: cloned.title ?? "Retrieved document",
        filename: cloned.filename,
        providerMetadata: cloned.providerMetadata,
      };
    },

    custom(kind = "test.output", options = {}) {
      return { kind, ...deepClone(options) };
    },
  };
}
