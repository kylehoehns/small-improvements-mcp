import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { normalizeFeedbackDetail } from "../src/normalize.js";

const provided = JSON.parse(readFileSync("test/fixtures/feedback-detail-provided.json", "utf8")); // array
const received = JSON.parse(readFileSync("test/fixtures/feedback-detail-received.json", "utf8")); // object

describe("normalizeFeedbackDetail", () => {
  it("unwraps an array-shaped detail and extracts question answers", () => {
    const fb = normalizeFeedbackDetail(provided);
    expect(typeof fb.topic).toBe("string");
    expect(Array.isArray(fb.questions)).toBe(true);
    const withAnswer = fb.questions.find((q) => q.answers.length > 0);
    expect(withAnswer).toBeDefined();
    expect(withAnswer!.answers[0]).toHaveProperty("reviewer");
    expect(withAnswer!.answers[0].text).not.toContain("MARKUP_VERSION");
  });

  it("handles an object-shaped detail (no thrown error on empty answers)", () => {
    const fb = normalizeFeedbackDetail(received);
    expect(fb.id).toBe(received.id);
    expect(Array.isArray(fb.questions)).toBe(true);
  });
});
