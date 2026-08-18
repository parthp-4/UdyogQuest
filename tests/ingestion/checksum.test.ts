import { describe, expect, it } from "vitest";
import { computeChecksum, isUnchanged } from "@/lib/ingestion/checksum";

describe("computeChecksum / isUnchanged", () => {
  it("produces the same checksum for identical content", () => {
    expect(computeChecksum("hello world")).toBe(computeChecksum("hello world"));
  });

  it("produces a different checksum for different content", () => {
    expect(computeChecksum("hello world")).not.toBe(computeChecksum("hello world!"));
  });

  it("reports unchanged when checksums match", () => {
    const checksum = computeChecksum("some official content");
    expect(isUnchanged(checksum, checksum)).toBe(true);
  });

  it("reports changed when there is no previous checksum (a brand-new source)", () => {
    expect(isUnchanged(null, computeChecksum("content"))).toBe(false);
    expect(isUnchanged(undefined, computeChecksum("content"))).toBe(false);
  });

  it("reports changed when content differs", () => {
    expect(isUnchanged(computeChecksum("a"), computeChecksum("b"))).toBe(false);
  });
});
