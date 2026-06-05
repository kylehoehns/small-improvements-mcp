import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { normalizePraise } from "../src/normalize.js";

const received = JSON.parse(readFileSync("test/fixtures/praise-received.json", "utf8"));

describe("normalizePraise", () => {
  it("trims a praise item to review-relevant fields", () => {
    const p = normalizePraise(received[0]);
    expect(p.id).toBe(received[0].id);
    expect(typeof p.message).toBe("string");
    expect(p.message).not.toContain("<p>");
    expect(p.message).not.toContain("MARKUP_VERSION");
    expect(p.author).toHaveProperty("name");
    expect(Array.isArray(p.recipients)).toBe(true);
    expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
