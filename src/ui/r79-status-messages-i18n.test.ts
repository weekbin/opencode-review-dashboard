// R79 i18n: 5 hardcoded English setStatus messages (NOT showToast — those were R73 scope).

import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";

const TARGETS = [
  "Could not copy permalink", // incorrectly attributed to setStatus — actually showToast
  "Copied as Markdown", // incorrectly attributed to setStatus — actually showToast
  "Could not copy markdown", // incorrectly attributed to setStatus — actually showToast
  "No review data to export",
  "No changes to save",
  "Comment exceeds 500 characters",
  "Failed to add comment",
  "Comment added",
];

describe("R79 — setStatus messages use i18n keys", () => {
  // Skip the first 3 (R73 showToast scope). Focus on the 5 R79 setStatus targets.
  TARGETS.slice(3).forEach((target) => {
    it(`"${target}" hardcoded English is replaced with t()`, async () => {
      const ts = await Bun.file(APP_TS_PATH).text();
      expect(ts).not.toContain(`"${target}"`);
    });
  });

  it("t() calls are present for each setStatus site", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    expect(ts).toMatch(/setStatus\(t\("status\.noReviewData"\)/);
    expect(ts).toMatch(/setStatus\(t\("status\.noChangesToSave"\)/);
    expect(ts).toMatch(/setStatus\(t\("status\.commentTooLong"\)/);
    expect(ts).toMatch(/setStatus\(t\("status\.failedAddComment"\)/);
    expect(ts).toMatch(/setStatus\(t\("status\.commentAdded"\)/);
  });
});
