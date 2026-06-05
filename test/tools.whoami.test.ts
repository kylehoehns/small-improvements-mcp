import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import type { SiGetter } from "../src/siClient.js";
import { runWhoami } from "../src/tools/whoami.js";

const me = JSON.parse(readFileSync("test/fixtures/users-me.json", "utf8"));

function stub(): SiGetter {
  return { async get<T>(): Promise<T> { return me as unknown as T; } };
}

describe("runWhoami", () => {
  it("returns id, name, email and role", async () => {
    const who = await runWhoami(stub());
    expect(who.id).toBe(me.id);
    expect(who.name).toBe(me.name);
    expect(who.email).toBe(me.email);
    expect(who).toHaveProperty("role");
  });
});
