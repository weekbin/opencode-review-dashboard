// R73 prod bug: 3 copy-button handlers each use setTimeout(1200) to revert button textContent.
// If user clicks twice within 1200ms, the first timer fires and reverts the new button text back early.
// Fix: capture the timer ID per-button + clearTimeout before starting a new one.

import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";

async function loadTs(): Promise<string> {
  return await Bun.file(APP_TS_PATH).text();
}

describe("R73 — copy-button timers do not leak across rapid clicks", () => {
  function getBlockNearMarker(ts: string, marker: string, radius = 500): string {
    const idx = ts.indexOf(marker);
    if (idx < 0) return "";
    return ts.substring(Math.max(0, idx - radius), idx + radius);
  }

  it("copyFindingPermalink clears previous setTimeout before starting a new one", async () => {
    const ts = await loadTs();
    const block = getBlockNearMarker(ts, "Copied permalink for");
    expect(block).toContain("_copyPermalinkFeedbackTimer");
    expect(block).toMatch(/clearTimeout[\s\S]*?\._copyPermalinkFeedbackTimer/);
    expect(block).toMatch(/_copyPermalinkFeedbackTimer\s*=\s*setTimeout/);
  });

  it("copyAsMarkdown clears previous setTimeout before starting a new one", async () => {
    const ts = await loadTs();
    const block = getBlockNearMarker(ts, "Copied as Markdown");
    expect(block).toContain("_copyMarkdownFeedbackTimer");
    expect(block).toMatch(/clearTimeout[\s\S]*?\._copyMarkdownFeedbackTimer/);
    expect(block).toMatch(/_copyMarkdownFeedbackTimer\s*=\s*setTimeout/);
  });

  it("copyBranch clears previous setTimeout before starting a new one", async () => {
    const ts = await loadTs();
    const block = getBlockNearMarker(ts, "✓ ${label}");
    expect(block).toContain("_copyBranchFeedbackTimer");
    expect(block).toMatch(/clearTimeout[\s\S]*?\._copyBranchFeedbackTimer/);
    expect(block).toMatch(/_copyBranchFeedbackTimer\s*=\s*setTimeout/);
  });
});
