import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import type { SiGetter } from "../src/siClient.js";
import { runGetReviews } from "../src/tools/reviews.js";

const reviews = JSON.parse(readFileSync("test/fixtures/reviews-your.json", "utf8"));

function stub(): SiGetter {
  return { async get<T>(): Promise<T> { return reviews as unknown as T; } };
}

describe("runGetReviews", () => {
  it("returns one normalized entry per cycle with structure only", async () => {
    const result = await runGetReviews(stub());
    expect(result.length).toBe(reviews.length);
    expect(result[0]).toHaveProperty("cycleName");
    expect(result[0]).toHaveProperty("underReviewFrom");
    expect(Array.isArray(result[0].reviews)).toBe(true);
    expect(result[0].reviews[0]).toHaveProperty("role");
    expect(result[0].reviews[0]).toHaveProperty("contributingReviewers");
  });
});
