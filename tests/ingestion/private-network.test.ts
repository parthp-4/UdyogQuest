import { describe, expect, it } from "vitest";
import { isDisallowedHostLiteral, isPrivateOrLoopbackIp } from "@/lib/ingestion/private-network";

describe("isPrivateOrLoopbackIp", () => {
  it.each([
    ["127.0.0.1", true],
    ["10.0.0.5", true],
    ["172.16.0.1", true],
    ["172.31.255.255", true],
    ["172.32.0.1", false],
    ["192.168.1.1", true],
    ["169.254.1.1", true],
    ["8.8.8.8", false],
    ["1.1.1.1", false],
    ["::1", true],
    ["fe80::1", true],
    ["fc00::1", true],
    ["2001:4860:4860::8888", false]
  ])("classifies %s as private=%s", (address, expected) => {
    expect(isPrivateOrLoopbackIp(address)).toBe(expected);
  });
});

describe("isDisallowedHostLiteral", () => {
  it("disallows localhost and 0.0.0.0", () => {
    expect(isDisallowedHostLiteral("localhost")).toBe(true);
    expect(isDisallowedHostLiteral("0.0.0.0")).toBe(true);
  });

  it("allows a real public hostname", () => {
    expect(isDisallowedHostLiteral("foscos.fssai.gov.in")).toBe(false);
  });
});
