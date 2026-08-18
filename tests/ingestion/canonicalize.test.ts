import { describe, expect, it } from "vitest";
import { canonicalizeUrl } from "@/lib/ingestion/canonicalize";

describe("canonicalizeUrl", () => {
  it("strips the fragment", () => {
    expect(canonicalizeUrl("https://example.gov.in/page#section")).toBe("https://example.gov.in/page");
  });

  it("lower-cases the hostname", () => {
    expect(canonicalizeUrl("https://EXAMPLE.gov.in/page")).toBe("https://example.gov.in/page");
  });

  it("removes a trailing slash from non-root paths", () => {
    expect(canonicalizeUrl("https://example.gov.in/page/")).toBe("https://example.gov.in/page");
  });

  it("keeps the root path slash", () => {
    expect(canonicalizeUrl("https://example.gov.in/")).toBe("https://example.gov.in/");
  });

  it("sorts query parameters so param order does not create duplicate sources", () => {
    expect(canonicalizeUrl("https://example.gov.in/page?b=2&a=1")).toBe(canonicalizeUrl("https://example.gov.in/page?a=1&b=2"));
  });

  it("removes the default https port", () => {
    expect(canonicalizeUrl("https://example.gov.in:443/page")).toBe("https://example.gov.in/page");
  });
});
