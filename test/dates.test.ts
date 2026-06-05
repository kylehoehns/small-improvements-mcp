import { describe, it, expect } from "vitest";
import { toApiDate, defaultYearRange } from "../src/dates.js";

describe("date helpers", () => {
  it("formats a date as yyyy-MM-dd", () => {
    expect(toApiDate(new Date("2026-06-03T12:34:56Z"))).toBe("2026-06-03");
  });

  it("defaultYearRange spans the trailing 12 months", () => {
    const now = new Date("2026-06-03T00:00:00Z");
    const range = defaultYearRange(now);
    expect(range.endDate).toBe("2026-06-03");
    expect(range.startDate).toBe("2025-06-03");
  });
});
