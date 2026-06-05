import { describe, it, expect } from "vitest";
import { collectPages } from "../src/siClient.js";

describe("collectPages", () => {
  it("accumulates items across pages until a short page", async () => {
    const pages = [
      ["a", "b"],
      ["c", "d"],
      ["e"],
    ];
    const fetchPage = async (offset: number) => pages[offset / 2] ?? [];

    const all = await collectPages<string>(fetchPage, 2);

    expect(all).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("stops immediately when the first page is short", async () => {
    let calls = 0;
    const fetchPage = async (_offset: number) => {
      calls += 1;
      return ["only"];
    };

    const all = await collectPages<string>(fetchPage, 50);

    expect(all).toEqual(["only"]);
    expect(calls).toBe(1);
  });
});
