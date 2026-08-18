export type EmbeddingVector = number[];

export interface EmbeddingProvider {
  readonly name: string;
  embed(text: string): Promise<EmbeddingVector | null>;
}

/**
 * No-op placeholder so retrieval code can depend on an EmbeddingProvider interface without
 * requiring a configured vector service. Phase 2D explicitly says to "add vector search
 * only after the schema, migrations, local setup, and fallback path are reliable" -- this
 * keeps that door open (KnowledgeChunk.embedding already exists as a Json? column) without
 * building unused vector-search infrastructure in this slice. Keyword/full-text retrieval
 * (lib/rag/retriever.ts + lib/rag/ranking.ts) remains the real fallback path.
 */
export class NullEmbeddingProvider implements EmbeddingProvider {
  readonly name = "null";

  async embed(_text: string): Promise<EmbeddingVector | null> {
    return null;
  }
}

export const embeddingProvider: EmbeddingProvider = new NullEmbeddingProvider();
