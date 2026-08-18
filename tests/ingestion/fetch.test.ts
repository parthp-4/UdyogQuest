import { describe, expect, it } from "vitest";
import { extractMetaRefreshTarget, validateFetchTarget } from "@/lib/ingestion/fetch";

describe("validateFetchTarget", () => {
  const allowedHosts = ["foscos.fssai.gov.in"];

  it("accepts an https URL on an allowlisted host", () => {
    expect(validateFetchTarget({ url: "https://foscos.fssai.gov.in/", allowedHosts }).ok).toBe(true);
  });

  it("accepts a subdomain of an allowlisted host", () => {
    expect(validateFetchTarget({ url: "https://sub.foscos.fssai.gov.in/page", allowedHosts }).ok).toBe(true);
  });

  it("rejects http (non-https) URLs", () => {
    expect(validateFetchTarget({ url: "http://foscos.fssai.gov.in/", allowedHosts }).ok).toBe(false);
  });

  it("rejects a host not in the allowlist", () => {
    expect(validateFetchTarget({ url: "https://evil.example.com/", allowedHosts }).ok).toBe(false);
  });

  it("rejects a host that merely contains the allowlisted string", () => {
    expect(validateFetchTarget({ url: "https://foscos.fssai.gov.in.evil.com/", allowedHosts }).ok).toBe(false);
  });

  it("rejects localhost even if allowlisted", () => {
    expect(validateFetchTarget({ url: "https://localhost/", allowedHosts: ["localhost"] }).ok).toBe(false);
  });

  it("rejects private IP literals even if allowlisted", () => {
    expect(validateFetchTarget({ url: "https://127.0.0.1/", allowedHosts: ["127.0.0.1"] }).ok).toBe(false);
    expect(validateFetchTarget({ url: "https://10.0.0.5/", allowedHosts: ["10.0.0.5"] }).ok).toBe(false);
    expect(validateFetchTarget({ url: "https://192.168.1.1/", allowedHosts: ["192.168.1.1"] }).ok).toBe(false);
  });

  it("rejects an unparseable URL", () => {
    expect(validateFetchTarget({ url: "not a url", allowedHosts }).ok).toBe(false);
  });
});

describe("extractMetaRefreshTarget", () => {
  it("extracts the target URL from a meta-refresh stub", () => {
    const html = '<html><head><meta http-equiv="refresh" content="0;url=CP/" /></head><body></body></html>';
    expect(extractMetaRefreshTarget(html)).toBe("CP/");
  });

  it("returns null when there is no meta-refresh tag", () => {
    expect(extractMetaRefreshTarget("<html><body><p>Real content</p></body></html>")).toBeNull();
  });

  it("is case-insensitive and tolerates spacing", () => {
    const html = '<META HTTP-EQUIV="Refresh" CONTENT="5 ; URL=https://example.gov.in/page" />';
    expect(extractMetaRefreshTarget(html)).toBe("https://example.gov.in/page");
  });
});
