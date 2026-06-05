import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import type { SiGetter } from "../src/siClient.js";
import { runYearInReview } from "../src/tools/yearInReview.js";

const me = JSON.parse(readFileSync("test/fixtures/users-me.json", "utf8"));
const praiseR = JSON.parse(readFileSync("test/fixtures/praise-received.json", "utf8"));
const objectives = JSON.parse(readFileSync("test/fixtures/objectives-relevant.json", "utf8"));
const reviews = JSON.parse(readFileSync("test/fixtures/reviews-your.json", "utf8"));

// Routes every endpoint to a fixture; feedback lists empty to keep the test fast.
function stub(): SiGetter {
  return {
    async get<T>(path: string, query?: Record<string, any>): Promise<T> {
      if (path === "/v2/users/me") return me as unknown as T;
      if (path === "/v2/praise") return (query?.offset ? [] : praiseR) as unknown as T;
      if (path.includes("objectives/relevant")) return objectives as unknown as T;
      if (path === "/v2/unified-feedback/your") return [] as unknown as T;
      if (path === "/v2/unified-feedback/you-provided") return [] as unknown as T;
      if (path === "/v2/review/yourReviews") return reviews as unknown as T;
      throw new Error(`unexpected path ${path}`);
    },
  };
}

describe("runYearInReview", () => {
  it("assembles one document across all sources", async () => {
    const doc = await runYearInReview(stub(), {});
    expect(doc.me.id).toBe(me.id);
    expect(doc.range.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(doc.praiseReceived.length).toBe(praiseR.length);
    expect(doc.objectives.length).toBe(objectives.length);
    expect(doc.reviews.length).toBe(reviews.length);
    expect(doc.errors).toEqual([]);
  });

  it("records a source failure in errors instead of throwing", async () => {
    const base = stub();
    const failing: SiGetter = {
      async get<T>(path: string, query?: Record<string, any>): Promise<T> {
        if (path === "/v2/review/yourReviews") throw new Error("reviews down");
        return base.get<T>(path, query);
      },
    };
    const doc = await runYearInReview(failing, {});
    expect(doc.errors.some((e) => e.source === "reviews")).toBe(true);
    expect(doc.reviews).toEqual([]);
    expect(doc.praiseReceived.length).toBe(praiseR.length);
  });
});
