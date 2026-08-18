export function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);
}

/** Deterministic lexical relevance score: count of content tokens that appear in the query. */
export function scoreRelevance(content: string, query: string): number {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return 0;

  let matches = 0;
  for (const token of tokenize(content)) {
    if (queryTokens.has(token)) matches += 1;
  }
  return matches;
}

/** Sorts by relevance score descending, stable on ties (preserves input order). */
export function rankByRelevance<T extends { content: string }>(items: T[], query: string): T[] {
  return items
    .map((item, index) => ({ item, index, score: scoreRelevance(item.content, query) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);
}
