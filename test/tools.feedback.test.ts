import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import type { SiGetter } from "../src/siClient.js";
import { runGetFeedback } from "../src/tools/feedback.js";

const yourList = JSON.parse(readFileSync("test/fixtures/feedback-your.json", "utf8"));
const detail = JSON.parse(readFileSync("test/fixtures/feedback-detail-received.json", "utf8"));

// Stub: received list returns two items; given list empty; details succeed except one id throws.
function stub(failId?: string): SiGetter {
  return {
    async get<T>(path: string): Promise<T> {
      if (path === "/v2/unified-feedback/your") return yourList.slice(0, 2) as unknown as T;
      if (path === "/v2/unified-feedback/you-provided") return [] as unknown as T;
      if (failId && path.endsWith(failId)) throw new Error("boom");
      return detail as unknown as T;
    },
  };
}

describe("runGetFeedback", () => {
  it("expands every received item to normalized detail", async () => {
    const result = await runGetFeedback(stub(), { direction: "received" });
    expect(result.received.items.length).toBe(2);
    expect(result.received.errors.length).toBe(0);
    expect(result.given.items).toEqual([]);
  });

  it("collects per-item detail failures instead of throwing", async () => {
    const failId = yourList[0].id;
    const result = await runGetFeedback(stub(failId), { direction: "received" });
    expect(result.received.errors.length).toBe(1);
    expect(result.received.items.length).toBe(1);
  });
});
