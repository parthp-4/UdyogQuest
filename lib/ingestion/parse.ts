/**
 * HTML parse adapter: strips scripts, styles, comments, and tags to produce clean text.
 * PDF parsing is intentionally not implemented yet -- the two Phase 2B seed sources are
 * HTML portal pages, and the crawler milestone (2C) adds other formats only with tests.
 */
export function parseHtml(rawHtml: string): { parsedText: string } {
  const parsedText = rawHtml
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

  return { parsedText };
}

/** Splits normalised text into fixed-size chunks for KnowledgeChunk rows. */
export function chunkText(value: string, size = 1400): string[] {
  const chunks: string[] = [];
  for (let index = 0; index < value.length; index += size) {
    const chunk = value.slice(index, index + size).trim();
    if (chunk) chunks.push(chunk);
  }
  return chunks;
}
