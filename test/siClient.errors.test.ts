import { describe, it, expect } from "vitest";
import { SiApiError, mapError } from "../src/siClient.js";

describe("mapError", () => {
  it("gives a token-specific message for 401", () => {
    const err = mapError(401, "unauthorized");
    expect(err).toBeInstanceOf(SiApiError);
    expect(err.status).toBe(401);
    expect(err.message).toMatch(/token/i);
  });

  it("gives a permission message for 403", () => {
    expect(mapError(403, "forbidden").message).toMatch(/permission/i);
  });

  it("includes status and body for other errors", () => {
    const err = mapError(500, "boom");
    expect(err.message).toContain("500");
    expect(err.message).toContain("boom");
  });
});
