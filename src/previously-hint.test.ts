/**
 * Unit tests for R7 MINOR #2 — Previously discussed panel UI hint.
 *
 * Covers AC7-2.1, AC7-2.2, AC7-2.3.
 *
 * Mirrors the static-analysis approach used in
 * `src/abort-controller.test.ts` (and the existing patterns in
 * `src/drawer-refactor.test.ts` and `src/prior-notes.test.ts` AC9):
 * since `src/ui/app.ts` is browser-only and not directly importable in
 * a unit-test environment, these tests assert the hint DOM-creation
 * code is present and correctly placed. Runtime behavior is covered by
 * the new e2e scenario `previously-discussed-hint` in
 * `scripts/test-review-ui/scenarios.mjs`.
 *
 * Run with:  bun run test:unit
 */

import * as fsPromises from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "bun:test";

const APP_TS = join(import.meta.dir, "ui", "app.ts");

async function readAppTs(): Promise<string> {
  return fsPromises.readFile(APP_TS, "utf8");
}

function sliceRenderPreviouslyDiscussedPanel(src: string): string {
  const fnStart = src.indexOf("function renderPreviouslyDiscussedPanel(");
  expect(fnStart).toBeGreaterThanOrEqual(0);
  const bodyStart = src.indexOf("{", fnStart);
  expect(bodyStart).toBeGreaterThan(fnStart);
  let depth = 1;
  let i = bodyStart + 1;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    i++;
  }
  return src.slice(bodyStart, i);
}

describe("AC7-2.1 — hint renders when currentRound > 1", () => {
  it("T7.4a hint element is created with class 'previously-panel-hint'", async () => {
    const src = await readAppTs();
    const body = sliceRenderPreviouslyDiscussedPanel(src);
    expect(body).toMatch(/document\.createElement\("p"\)/);
    expect(body).toMatch(/hint\.className\s*=\s*"previously-panel-hint"/);
  });

  it("T7.4b hint text references prior rounds and the Conversation tab", async () => {
    const src = await readAppTs();
    const body = sliceRenderPreviouslyDiscussedPanel(src);
    expect(body).toMatch(/hint\.textContent\s*=\s*`Showing prior rounds only/);
    expect(body).toMatch(/Conversation tab/);
  });

  it("T7.4c hint is appended to root", async () => {
    const src = await readAppTs();
    const body = sliceRenderPreviouslyDiscussedPanel(src);
    expect(body).toMatch(/root\.appendChild\(hint\)/);
  });

  it("T7.4d hint is placed AFTER the empty-state early return (non-empty branch only)", async () => {
    const src = await readAppTs();
    const body = sliceRenderPreviouslyDiscussedPanel(src);
    const emptyReturnIdx = body.indexOf('"No prior discussion yet.');
    expect(emptyReturnIdx).toBeGreaterThanOrEqual(0);
    const hintIdx = body.indexOf('className = "previously-panel-hint"');
    expect(hintIdx).toBeGreaterThan(emptyReturnIdx);
  });

  it("T7.4e hint is guarded by currentRound > 1 (AC7-2.1 boundary)", async () => {
    const src = await readAppTs();
    const body = sliceRenderPreviouslyDiscussedPanel(src);
    expect(body).toMatch(/if\s*\(\s*currentRound\s*>\s*1\s*\)/);
  });
});

describe("AC7-2.2 — no hint when currentRound <= 1", () => {
  it("T7.4f hint is wrapped in currentRound > 1 guard (round 1 stays empty-state only)", async () => {
    const src = await readAppTs();
    const body = sliceRenderPreviouslyDiscussedPanel(src);
    // Round 1 has currentRound === 1; the guard `currentRound > 1` excludes it.
    // Round 0 / missing round data has currentRound === 0; the guard excludes it too.
    // The exact `> 1` (not `>= 1`, not `> 0`) is the AC7-2.2 boundary.
    const guardMatch = body.match(/if\s*\(\s*currentRound\s*([><=]+)\s*(\d+)\s*\)/);
    expect(guardMatch).not.toBeNull();
    if (!guardMatch) return;
    const [, op, valueRaw] = guardMatch;
    const value = Number(valueRaw);
    // Verify the guard excludes currentRound === 1 (round 1's empty-state is self-explanatory).
    // For `currentRound > 1`: 1 > 1 is FALSE → round 1 excluded ✓
    // For `currentRound > 0`: 1 > 0 is TRUE  → round 1 NOT excluded ✗ (would show hint on round 1)
    // For `currentRound >= 2`: 1 >= 2 is FALSE → round 1 excluded ✓
    // For `currentRound === 2`: depends — only triggers exactly at round 2.
    let excludesOne = false;
    if (op === ">") excludesOne = value <= 1;
    if (op === ">=") excludesOne = value <= 1;
    if (op === "===") excludesOne = value !== 1;
    if (op === "!==") excludesOne = value === 1;
    expect(excludesOne).toBe(true);
  });
});

describe("AC7-2.3 — hint text concise (≤2 lines, ≤200 chars)", () => {
  it("T7.4g hint text is short", async () => {
    const src = await readAppTs();
    const body = sliceRenderPreviouslyDiscussedPanel(src);
    const m = body.match(/hint\.textContent\s*=\s*`([^`]+)`/);
    expect(m).not.toBeNull();
    if (!m) return;
    const text: string = m[1] ?? "";
    // Strip template-literal interpolations (best-effort character count).
    const approxText = text.replace(/\$\{[^}]+\}/g, "NN");
    expect(approxText.length).toBeLessThanOrEqual(200);
  });
});
