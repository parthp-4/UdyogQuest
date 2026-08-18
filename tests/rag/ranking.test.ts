import { describe, expect, it } from "vitest";
import { rankByRelevance, scoreRelevance, tokenize } from "@/lib/rag/ranking";

describe("scoreRelevance", () => {
  it("scores zero when there is no overlap", () => {
    expect(scoreRelevance("apples and oranges", "bananas")).toBe(0);
  });

  it("counts matching tokens", () => {
    expect(scoreRelevance("fssai registration requires pan and aadhaar", "fssai aadhaar")).toBe(2);
  });

  it("is case-insensitive", () => {
    expect(scoreRelevance("FSSAI Registration", "fssai")).toBe(1);
  });
});

describe("rankByRelevance", () => {
  it("ranks more relevant chunks first", () => {
    const items = [
      { id: "low", content: "unrelated content about weather" },
      { id: "high", content: "fssai registration fssai license fssai portal" }
    ];
    const ranked = rankByRelevance(items, "fssai");
    expect(ranked[0].id).toBe("high");
  });

  it("preserves original order on ties", () => {
    const items = [
      { id: "a", content: "no match here" },
      { id: "b", content: "also no match" }
    ];
    const ranked = rankByRelevance(items, "irrelevant-term");
    expect(ranked.map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("ranks a chunk matching more of a multi-word query above one matching fewer terms", () => {
    // Regression case for the empirically-found bug where a literal full-phrase SQL match
    // returned zero results for any real multi-word question -- ranking must still separate
    // a partial match from a strong match once the SQL layer does OR-per-token recall.
    const items = [
      { id: "partial", content: "This page discusses DGFT services generally." },
      { id: "strong", content: "DGFT export import trade policy and customs procedures." }
    ];
    const ranked = rankByRelevance(items, "export import trade policy");
    expect(ranked[0].id).toBe("strong");
  });
});

describe("tokenize", () => {
  it("lower-cases and splits on non-alphanumeric characters", () => {
    expect(tokenize("Export, Import & Trade-Policy!")).toEqual(["export", "import", "trade", "policy"]);
  });

  it("drops single-character tokens", () => {
    expect(tokenize("a b cd")).toEqual(["cd"]);
  });
});
