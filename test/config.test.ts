import { describe, it, expect } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("reads the token and defaults the base URL", () => {
    const cfg = loadConfig({ SI_API_TOKEN: "abc123" });
    expect(cfg.token).toBe("abc123");
    expect(cfg.baseUrl).toBe("https://app.small-improvements.com/api");
  });

  it("allows overriding the base URL", () => {
    const cfg = loadConfig({ SI_API_TOKEN: "abc123", SI_BASE_URL: "http://localhost/api/v2" });
    expect(cfg.baseUrl).toBe("http://localhost/api/v2");
  });

  it("throws a clear error when the token is missing", () => {
    expect(() => loadConfig({})).toThrow(/SI_API_TOKEN/);
  });
});
