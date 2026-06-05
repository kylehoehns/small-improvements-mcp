import { describe, it, expect } from "vitest";
import { stripMarkup, toIso, miniUser } from "../src/normalize.js";

describe("stripMarkup", () => {
  it("removes the markup-version marker, tags, and decodes entities", () => {
    const input = "<!--MARKUP_VERSION:v4--><p>Charlie &amp; I paired; it&#39;s great</p>";
    expect(stripMarkup(input)).toBe("Charlie & I paired; it's great");
  });

  it("returns empty string for null/undefined", () => {
    expect(stripMarkup(null)).toBe("");
    expect(stripMarkup(undefined)).toBe("");
  });
});

describe("toIso", () => {
  it("converts epoch millis to ISO", () => {
    expect(toIso(1776375893320)).toBe("2026-04-16T21:44:53.320Z");
  });

  it("passes through ISO strings (normalized)", () => {
    expect(toIso("2026-03-24T19:50:46.637Z")).toBe("2026-03-24T19:50:46.637Z");
  });

  it("returns null for null/undefined", () => {
    expect(toIso(null)).toBeNull();
    expect(toIso(undefined)).toBeNull();
  });
});

describe("miniUser", () => {
  it("keeps only id and name", () => {
    expect(miniUser({ id: "u1", name: "Kyle", email: "x@y.z" })).toEqual({ id: "u1", name: "Kyle" });
  });
});
