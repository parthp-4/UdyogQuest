import { describe, expect, it } from "vitest";
import { chunkText, parseHtml } from "@/lib/ingestion/parse";

describe("parseHtml", () => {
  it("strips script and style tags along with their content", () => {
    const html = "<html><head><style>.a{color:red}</style></head><body><script>alert(1)</script><p>Hello</p></body></html>";
    const { parsedText } = parseHtml(html);
    expect(parsedText).not.toContain("alert");
    expect(parsedText).not.toContain("color:red");
    expect(parsedText).toContain("Hello");
  });

  it("collapses whitespace", () => {
    const { parsedText } = parseHtml("<p>a</p>\n\n  <p>b</p>");
    expect(parsedText).toBe("a b");
  });

  it("removes HTML comments", () => {
    const { parsedText } = parseHtml("<p>a<!-- hidden -->b</p>");
    expect(parsedText).not.toContain("hidden");
  });
});

describe("chunkText", () => {
  it("splits content into chunks of the given size", () => {
    const text = "a".repeat(2500);
    const chunks = chunkText(text, 1000);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toHaveLength(1000);
    expect(chunks[2]).toHaveLength(500);
  });

  it("returns an empty array for empty input", () => {
    expect(chunkText("", 1000)).toEqual([]);
  });

  it("drops empty/whitespace-only chunks", () => {
    const chunks = chunkText("abc   ", 3);
    expect(chunks.every((chunk) => chunk.length > 0)).toBe(true);
  });
});
