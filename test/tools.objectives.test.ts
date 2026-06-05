import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import type { SiGetter } from "../src/siClient.js";
import { runGetObjectives } from "../src/tools/objectives.js";

const objectives = JSON.parse(readFileSync("test/fixtures/objectives-relevant.json", "utf8"));

function stub(): SiGetter {
  return { async get<T>(): Promise<T> { return objectives as unknown as T; } };
}

describe("runGetObjectives", () => {
  it("normalizes objectives to title/status/completion", async () => {
    const result = await runGetObjectives(stub(), "me", {});
    expect(result.length).toBe(objectives.length);
    expect(result[0]).toHaveProperty("title");
    expect(result[0]).toHaveProperty("status");
    expect(result[0]).toHaveProperty("completionPercentage");
    expect(result[0].rating === null || typeof result[0].rating === "number").toBe(true);
  });
});
