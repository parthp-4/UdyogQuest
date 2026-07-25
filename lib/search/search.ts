import { getKnowledgeArticles } from "@/lib/knowledge/queries";

export async function globalSearch(query: string) {
  return getKnowledgeArticles(query);
}

