import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import type { SiGetter } from "../src/siClient.js";
import { runGetPraise } from "../src/tools/praise.js";

const received = JSON.parse(readFileSync("test/fixtures/praise-received.json", "utf8"));
const given = JSON.parse(readFileSync("test/fixtures/praise-given.json", "utf8"));

function stub(): SiGetter {
  return {
    async get<T>(_path: string, query?: Record<string, any>): Promise<T> {
      if (query?.offset && query.offset > 0) return [] as unknown as T;
      if (query?.recipientId) return received as unknown as T;
      if (query?.authorId) return given as unknown as T;
      return [] as unknown as T;
    },
  };
}

describe("runGetPraise", () => {
  it("returns both directions normalized by default", async () => {
    const result = await runGetPraise(stub(), "me", {});
    expect(result.received.length).toBe(received.length);
    expect(result.given.length).toBe(given.length);
    expect(result.received[0]).toHaveProperty("message");
  });

  it("returns only received when direction=received", async () => {
    const result = await runGetPraise(stub(), "me", { direction: "received" });
    expect(result.received.length).toBe(received.length);
    expect(result.given).toEqual([]);
  });
});
