// Frakment chat engine — payload factory for files, sources, and custom parts.

import type { IdGenerator } from "./ids";
import type {
  FilePayload,
  JsonRecord,
  ReasoningFilePayload,
  SourceDocumentPayload,
  SourceUrlPayload,
} from "./types";
import { deepClone } from "./utils";

export interface PayloadFactory {
  custom: (
    kind?: string,
    options?: JsonRecord
  ) => { kind: string } & JsonRecord;
  file: (overrides?: Partial<FilePayload>) => FilePayload;
  reasoningFile: (
    overrides?: Partial<ReasoningFilePayload>
  ) => ReasoningFilePayload;
  sourceDocument: (
    overrides?: Partial<SourceDocumentPayload>
  ) => SourceDocumentPayload;
  sourceUrl: (overrides?: Partial<SourceUrlPayload>) => SourceUrlPayload;
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
    custom(kind = "test.output", options = {}) {
      return { kind, ...deepClone(options) };
    },
    file(overrides = {}) {
      return {
        filename: "receipt.png",
        mediaType: "image/png",
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

    sourceDocument(overrides = {}) {
      const cloned = deepClone(overrides);
      return {
        filename: cloned.filename,
        mediaType: cloned.mediaType ?? "text/markdown",
        providerMetadata: cloned.providerMetadata,
        sourceId: sourceId(cloned.sourceId),
        title: cloned.title ?? "Retrieved document",
      };
    },

    sourceUrl(overrides = {}) {
      const cloned = deepClone(overrides);
      return {
        providerMetadata: cloned.providerMetadata,
        sourceId: sourceId(cloned.sourceId),
        title: cloned.title ?? "AI SDK Docs",
        url: cloned.url ?? "https://ai-sdk.dev/docs",
      };
    },
  };
}
