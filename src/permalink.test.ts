/**
 * Unit tests for R11 #2 — Per-finding permalink anchors (GH#16).
 *
 * Covers AC2.1 (id="finding-<id>" attribute on rendered cards),
 * AC2.2 (Copy-link button + clipboard helper), AC2.3 (hash-scroll on
 * load + flash highlight), AC2.4 (graceful fallback when target
 * finding missing — toast path covered via setStatus static check),
 * AC2.5 (cross-round finding ID stability verified at the source-attrib
 * level; e2e cannot simulate round transitions per R3 lesson).
 *
 * Following the static-analysis pattern of `saved-replies.test.ts`: the
 * browser-only `src/ui/app.ts` cannot be imported directly under bun
 * test, so these tests read the source and assert the DOM + clipboard
 * helpers + hash parser + scroll/flash contract is correctly wired.
 *
 * Runtime flow (click Copy-link → clipboard payload) is covered by
 * `permalink` scenario (#25) in `scripts/test-review-ui/scenarios.mjs`,
 * with the full Playwright walkthrough.
 *
 * Run with:  bun run test:unit
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");
const HTML = join(import.meta.dir, "ui", "review.html");

async function readSource(path: string): Promise<string> {
  return fsPromises.readFile(path, "utf8");
}

describe('AC2.1 — id="finding-<id>" attribute on rendered finding cards', () => {
  it("T11.2a renderConversationPanel assigns item.id = finding-<entry.id>", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+renderConversationPanel[\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/item\.id\s*=\s*`finding-\$\{entry\.id\}`/);
  });

  it("T11.2b renderPreviouslyDiscussedPanel assigns findingItem.id = finding-<id>", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+renderPreviouslyDiscussedPanel[\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/findingItem\.id\s*=\s*`finding-\$\{finding\.id\}`/);
  });
});

describe("AC2.2 / AC2.3 / AC2.4 — Copy-link + hash scroll + flash", () => {
  it("T11.2c buildFindingPermalink uses window.location.origin + pathname + '#finding-' + id", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+buildFindingPermalink\s*\(\s*findingId:\s*string\s*\)/);
    const block = src.match(/function\s+buildFindingPermalink[\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/window\.location\.origin/);
    expect(block![0]).toMatch(/window\.location\.pathname/);
    expect(block![0]).toMatch(/#finding-\$\{findingId\}/);
  });

  it("T11.2d copyFindingPermalinkToClipboard uses navigator.clipboard.writeText + execCommand fallback + transient ✓ Copied label", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+copyFindingPermalinkToClipboard\s*\(/);
    const block = src.match(/function\s+copyFindingPermalinkToClipboard[\s\S]*?\n\}/);
    expect(block).toBeTruthy();
    expect(block![0]).toMatch(/navigator\.clipboard\?\.writeText/);
    expect(block![0]).toMatch(/document\.execCommand\(\s*"copy"\s*\)/);
    expect(block![0]).toMatch(/✓ Copied/);
    expect(block![0]).toMatch(/setStatus\(/);
  });

  it("T11.2e parseFindingHash + flashFindingPermaHighlight + resolveHashOnLoad wired", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+parseFindingHash\s*\(\s*hash:\s*string\s*\)/);
    const parser = src.match(/function\s+parseFindingHash[\s\S]*?\n\}/);
    expect(parser![0]).toMatch(/\^#finding-\(\.\+\)\$/);

    expect(src).toMatch(/function\s+flashFindingPermaHighlight\s*\(\s*findingId:\s*string\s*\)/);
    const flash = src.match(/function\s+flashFindingPermaHighlight[\s\S]*?\n\}/);
    expect(flash![0]).toMatch(/scrollIntoView/);
    expect(flash![0]).toMatch(/finding-permalink-flash/);

    expect(src).toMatch(/function\s+resolveHashOnLoad\s*\(\s*\)/);
    const resolve = src.match(/function\s+resolveHashOnLoad[\s\S]*?\n\}/);
    expect(resolve![0]).toMatch(/parseFindingHash\(window\.location\.hash\)/);
    expect(resolve![0]).toMatch(/setActiveTab\("conversation"\)/);

    expect(src).toMatch(/window\.addEventListener\(\s*"hashchange"/);
  });

  it("T11.2f CSS keyframe + .finding-permalink-flash + .finding-copy-link selectors exist in review.html", async () => {
    const html = await readSource(HTML);
    expect(html).toMatch(/@keyframes\s+finding-permalink-flash\s*\{/);
    expect(html).toMatch(/\.finding-permalink-flash\s*\{/);
    expect(html).toMatch(/\.finding-copy-link\s*\{/);
    expect(html).toMatch(/\.finding-copy-link:disabled\s*\{/);
  });
});
