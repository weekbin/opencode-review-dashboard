/**
 * Unit tests for R12 #19 — Jump-to-next/prev-finding keyboard nav (GH#19, close #19).
 *
 * Covers AC10 (global keydown listener for n/p with focus guard skipping
 * textarea/input), AC11 (getSortedFindings + currentFindingIndex wrap),
 * AC12 (status bar hint visible only when no textarea/input focused),
 * AC14 (the n/p nav respects the existing conversationFilter
 * composition — pinned/reacted filters work with n/p just like
 * open/resolved/all).
 *
 * Runtime flows (press n/p → scroll + flash) are verified via the
 * `n-jump-next` + `p-jump-prev` + `jump-skips-stale` e2e scenarios +
 * the Lead's Playwright walkthrough.
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

describe("AC10 — Global keydown listener for n/p with focus guard", () => {
  it("T12.K1a window.addEventListener('keydown') handler exists for n/p", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /window\.addEventListener\(\s*"keydown"\s*,\s*\(event\)\s*=>\s*\{[\s\S]*?if\s*\(event\.key\s*!==\s*"n"\s*&&\s*event\.key\s*!==\s*"p"\)\s*return/,
    );
  });

  it("T12.K1b isTextInputFocused guard skips when textarea/input/contentEditable is focused", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+isTextInputFocused\s*\(\s*\)/);
    const block = src.match(/function\s+isTextInputFocused\s*\([\s\S]*?\n\}/);
    expect(block![0]).toMatch(/tagName\s*===\s*"TEXTAREA"/);
    expect(block![0]).toMatch(/tagName\s*===\s*"INPUT"/);
    expect(block![0]).toMatch(/isContentEditable/);
  });

  it("T12.K1c n handler increments currentFindingIndex; p handler decrements", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(
      /window\.addEventListener\(\s*"keydown"\s*,\s*\(event\)\s*=>\s*\{[\s\S]*?\}\);/,
    );
    expect(block![0]).toMatch(/jumpToFindingByIndex\(currentFindingIndex\s*\+\s*1\)/);
    expect(block![0]).toMatch(/jumpToFindingByIndex\(currentFindingIndex\s*-\s*1\)/);
  });

  it("T12.K1d Skips when modifier keys (Cmd/Ctrl/Alt) are held (don't hijack OS shortcuts)", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(
      /window\.addEventListener\(\s*"keydown"\s*,\s*\(event\)\s*=>\s*\{[\s\S]*?\}\);/,
    );
    expect(block![0]).toMatch(/event\.metaKey\s*\|\|\s*event\.ctrlKey\s*\|\|\s*event\.altKey/);
  });

  it("T12.K1e Skips when activeTab is not 'conversation' (don't fire in Files/Commits/Previously)", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(
      /window\.addEventListener\(\s*"keydown"\s*,\s*\(event\)\s*=>\s*\{[\s\S]*?\}\);/,
    );
    expect(block![0]).toMatch(/state\.activeTab\s*!==\s*"conversation"/);
    expect(block![0]).toMatch(/return/);
  });
});

describe("AC11 — getSortedFindings + currentFindingIndex wrap-around", () => {
  it("T12.K2a getSortedFindings filters by current conversationFilter (open default)", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+getSortedFindings\s*\([\s\S]*?\n\}/);
    expect(block![0]).toMatch(/state\.conversationFilter\s*===\s*"open"/);
    expect(block![0]).toMatch(/e\.status\s*===\s*"open"\s*\|\|\s*e\.status\s*===\s*"closed_auto"/);
  });

  it("T12.K2b getSortedFindings returns entries sorted by (round DESC, created_at ASC)", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+getSortedFindings\s*\([\s\S]*?\n\}/);
    expect(block![0]).toMatch(/sort\(\(a,\s*b\)\s*=>\s*\{[\s\S]*?return\s+b\.round\s*-\s*a\.round/);
    expect(block![0]).toMatch(/return\s+a\.created_at\s*-\s*b\.created_at/);
  });

  it("T12.K2c jumpToFindingByIndex wraps on overflow (modulo + handle negative)", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+jumpToFindingByIndex\s*\([\s\S]*?\n\}/);
    expect(block![0]).toMatch(
      /\(\(index\s*%\s*sorted\.length\)\s*\+\s*sorted\.length\)\s*%\s*sorted\.length/,
    );
  });

  it("T12.K2d jumpToFindingByIndex reuses flashFindingPermaHighlight (R11 helper) for scroll + flash", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+jumpToFindingByIndex\s*\([\s\S]*?\n\}/);
    expect(block![0]).toMatch(/flashFindingPermaHighlight\(target\.id\)/);
  });

  it("T12.K2e currentFindingIndex is in-memory (let) — NOT persisted to localStorage", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/let\s+currentFindingIndex\s*=\s*-1/);
    expect(src).not.toMatch(/writeStored\(.*currentFindingIndex/);
  });
});

describe("AC12 — Status bar hint visibility tied to textarea/input focus + activeTab", () => {
  it("T12.K3a nav-hint element created + appended to document.body on first use", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/function\s+ensureNavHint\s*\(\)/);
    expect(src).toMatch(/className\s*=\s*"nav-hint"/);
    expect(src).toMatch(/document\.body\.appendChild\(el\)/);
  });

  it("T12.K3b nav-hint text reads 'Press n / p to navigate findings'", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(/Press\s*<kbd>n<\/kbd>\s*\/\s*<kbd>p<\/kbd>\s*to navigate findings/);
  });

  it("T12.K3c updateNavHint hides the hint when textarea/input is focused OR activeTab is not conversation", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+updateNavHint\s*\([\s\S]*?\n\}/);
    expect(block![0]).toMatch(/!isTextInputFocused\(\)/);
    expect(block![0]).toMatch(/state\.activeTab\s*===\s*"conversation"/);
    expect(block![0]).toMatch(/el\.hidden\s*=\s*!showHint/);
  });

  it("T12.K3d focusin + focusout listeners trigger updateNavHint so the hint reacts to focus changes", async () => {
    const src = await readSource(APP_TS);
    expect(src).toMatch(
      /window\.addEventListener\(\s*"focusin"\s*,\s*\(\)\s*=>\s*updateNavHint\(\)\)/,
    );
    expect(src).toMatch(
      /window\.addEventListener\(\s*"focusout"\s*,\s*\(\)\s*=>\s*updateNavHint\(\)\)/,
    );
  });

  it("T12.K3e setActiveTab calls updateNavHint so the hint reacts to tab switches", async () => {
    const src = await readSource(APP_TS);
    const block = src.match(/function\s+setActiveTab\s*\([\s\S]*?\n\}/);
    expect(block![0]).toMatch(/updateNavHint\(\)/);
  });

  it("T12.K3f CSS for .nav-hint + kbd inside exists in review.html", async () => {
    const html = await readSource(HTML);
    expect(html).toMatch(/\.nav-hint\s*\{/);
    expect(html).toMatch(/\.nav-hint\s+kbd\s*\{/);
  });
});
