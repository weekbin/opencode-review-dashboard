// R74 extends R73's stale-timer-race fix to:
// 1. finding-permalink-flash (app.ts:494): flashFindingPermaHighlight uses setTimeout(1600)
// 2. diff-search-match-flash (app.ts:737): flashDiffSearchMatch uses setTimeout(DIFF_SEARCH_FLASH_MS)
//
// Both functions already force reflow to re-trigger CSS animation, but the STALE TIMER
// from a rapid third call could fire and remove the class early.

import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";

async function loadTs(): Promise<string> {
  return await Bun.file(APP_TS_PATH).text();
}

describe("R74 — finding-permalink-flash + diff-search-match-flash protect against rapid re-trigger", () => {
  it("flashFindingPermaHighlight clears any pending _findingPermaFlashTimer", async () => {
    const ts = await loadTs();
    expect(ts).toMatch(
      /function flashFindingPermaHighlight[\s\S]*?clearTimeout\([\s\S]*?_findingPermaFlashTimer/,
    );
    expect(ts).toMatch(/_findingPermaFlashTimer\s*=\s*setTimeout/);
  });

  it("flashDiffSearchMatch clears any pending _diffSearchMatchFlashTimer", async () => {
    const ts = await loadTs();
    expect(ts).toMatch(
      /function flashDiffSearchMatch[\s\S]*?clearTimeout\([\s\S]*?_diffSearchMatchFlashTimer/,
    );
    expect(ts).toMatch(/_diffSearchMatchFlashTimer\s*=\s*setTimeout/);
  });
});
