import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { rankByRelevance, tokenize } from "@/lib/rag/ranking";

const MAX_QUERY_TOKENS = 8;

export type RetrievedChunk = {
  id: string;
  content: string;
  sourceTitle: string;
  officialUrl: string;
  authority: string;
  lastUpdated: Date | null;
  fetchedAt: Date | null;
  verificationState: string;
  sourceVersionId: string | null;
  industry: string | null;
};

export type RetrievalFilters = {
  industry?: "FOOD" | "EXPORT_IMPORT";
  limit?: number;
};

/**
 * Retrieves VERIFIED, current-version evidence via full-text (contains) matching, then
 * applies deterministic lexical ranking on top of the database result set. This is the
 * "reliable fallback" retrieval layer described in Phase 2D -- an embedding-based path can
 * be added later behind lib/rag/embeddings.ts without changing this contract.
 */
export async function retrieveVerifiedChunks(query: string, filters: RetrievalFilters = {}): Promise<RetrievedChunk[]> {
  if (!isDatabaseConfigured()) return [];
  if (!query.trim()) return [];

  const limit = filters.limit ?? 8;

  // Match on any significant query token (the SQL-level recall net), then let
  // rankByRelevance() do precision scoring across all matched tokens. A literal
  // full-phrase `contains` match here would miss almost every real multi-word question --
  // confirmed empirically against the live FoSCoS/DGFT data during Phase 2B verification.
  const queryTokens = tokenize(query).slice(0, MAX_QUERY_TOKENS);
  if (queryTokens.length === 0) return [];

  const chunks = await prisma.knowledgeChunk.findMany({
    where: {
      OR: queryTokens.map((token) => ({ content: { contains: token, mode: "insensitive" as const } })),
      document: {
        source: { status: "VERIFIED" },
        ...(filters.industry ? { industry: filters.industry } : {})
      }
    },
    include: {
      document: {
        include: {
          source: {
            include: {
              authority: true,
              versions: { where: { isCurrent: true }, take: 1 }
            }
          }
        }
      }
    },
    take: Math.max(limit * 4, limit), // over-fetch so ranking has something to rank
    orderBy: { createdAt: "desc" }
  });

  const mapped: RetrievedChunk[] = chunks.map((chunk) => ({
    id: chunk.id,
    content: chunk.content,
    sourceTitle: chunk.document.source.title,
    officialUrl: chunk.document.source.officialUrl,
    authority: chunk.document.source.authority.name,
    lastUpdated: chunk.document.source.lastUpdated,
    fetchedAt: chunk.document.source.fetchedAt,
    verificationState: chunk.document.source.status,
    sourceVersionId: chunk.document.source.versions[0]?.id ?? null,
    industry: chunk.document.industry
  }));

  return rankByRelevance(mapped, query).slice(0, limit);
}
