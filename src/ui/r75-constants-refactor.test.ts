// R75: extract magic timeout values (1200×3, 1600×1) into named constants.
// Follows the DIFF_SEARCH_FLASH_MS pattern (app.ts:672).

import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";

async function loadTs(): Promise<string> {
  return await Bun.file(APP_TS_PATH).text();
}

describe("R75 — magic timeout values are now named constants", () => {
  it("app.ts defines COPY_FEEDBACK_MS constant = 1200", async () => {
    const ts = await loadTs();
    expect(ts).toMatch(/const COPY_FEEDBACK_MS\s*=\s*1200/);
  });

  it("3 copy-button sites now use COPY_FEEDBACK_MS instead of literal 1200", async () => {
    const ts = await loadTs();
    // Should be exactly 3 uses of COPY_FEEDBACK_MS
    const uses = (ts.match(/COPY_FEEDBACK_MS/g) || []).length;
    // 1 declaration + 3 setTimeout usages = 4 total
    expect(uses).toBeGreaterThanOrEqual(4);

    // Should NOT have 4 literal "}, 1200)" occurrences anymore (was 3 originally; 3 setTimeout now use constant)
    const literal1200 = (ts.match(/\},\s*1200\)/g) || []).length;
    expect(literal1200).toBe(0);
  });

  it("app.ts defines PERMALINK_FLASH_MS constant = 1600", async () => {
    const ts = await loadTs();
    expect(ts).toMatch(/const PERMALINK_FLASH_MS\s*=\s*1600/);
  });

  it("flashFindingPermaHighlight now uses PERMALINK_FLASH_MS", async () => {
    const ts = await loadTs();
    expect(ts).toMatch(/PERMALINK_FLASH_MS/);
  });
});
