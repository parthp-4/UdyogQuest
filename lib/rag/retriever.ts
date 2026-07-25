import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export type RetrievedChunk = {
  id: string;
  content: string;
  sourceTitle: string;
  officialUrl: string;
  authority: string;
  lastUpdated: Date | null;
};

export async function retrieveVerifiedChunks(query: string, limit = 8): Promise<RetrievedChunk[]> {
  if (!isDatabaseConfigured()) return [];
  if (!query.trim()) return [];

  const chunks = await prisma.knowledgeChunk.findMany({
    where: {
      content: { contains: query, mode: "insensitive" },
      document: {
        source: { status: "VERIFIED" }
      }
    },
    include: {
      document: {
        include: {
          source: {
            include: { authority: true }
          }
        }
      }
    },
    take: limit,
    orderBy: { createdAt: "desc" }
  });

  return chunks.map((chunk) => ({
    id: chunk.id,
    content: chunk.content,
    sourceTitle: chunk.document.source.title,
    officialUrl: chunk.document.source.officialUrl,
    authority: chunk.document.source.authority.name,
    lastUpdated: chunk.document.source.lastUpdated
  }));
}
