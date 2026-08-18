import { afterEach, describe, expect, it } from "vitest";
import { getAppDataMode } from "@/lib/runtime/mode";

const originalMode = process.env.APP_DATA_MODE;
const originalDbUrl = process.env.DATABASE_URL;

describe("getAppDataMode", () => {
  afterEach(() => {
    if (originalMode === undefined) delete process.env.APP_DATA_MODE;
    else process.env.APP_DATA_MODE = originalMode;
    if (originalDbUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDbUrl;
  });

  it("defaults to DEMO when APP_DATA_MODE is unset", () => {
    delete process.env.APP_DATA_MODE;
    expect(getAppDataMode()).toBe("DEMO");
  });

  it("returns LIVE when explicitly selected and DATABASE_URL is set", () => {
    process.env.APP_DATA_MODE = "live";
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/testdb";
    expect(getAppDataMode()).toBe("LIVE");
  });

  it("throws instead of silently falling back to demo when LIVE is selected without DATABASE_URL", () => {
    process.env.APP_DATA_MODE = "live";
    delete process.env.DATABASE_URL;
    expect(() => getAppDataMode()).toThrow(/DATABASE_URL/);
  });

  it("throws on an invalid APP_DATA_MODE value", () => {
    process.env.APP_DATA_MODE = "staging";
    expect(() => getAppDataMode()).toThrow(/Invalid APP_DATA_MODE/);
  });

  it("is case-insensitive", () => {
    process.env.APP_DATA_MODE = "DEMO";
    expect(getAppDataMode()).toBe("DEMO");
  });
});
