// R168 AC6: regression test for the in-diff search debounce.
// R168 wrapped the findMatchesInDiff call inside runSearch() with a 150ms
// debounce. Without the debounce, findMatchesInDiff runs synchronously on
// every keystroke — O(N) per character, sluggish on 1000+ line diffs.
// This test asserts the debounce infrastructure exists. Behavior is
// verified indirectly via the in-diff-search e2e scenario (35/35 pass).

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const APP_TS = join(import.meta.dir, "app.ts");

function readSrc(path: string): string {
  return readFileSync(path, "utf-8");
}

function extractRunSearchBody(src: string): string {
  // Find `const runSearch = () => { ... };` block
  const start = src.indexOf("const runSearch = () =>");
  if (start < 0) return "";
  // Find the matching closing `};`. Use simple brace counting.
  let depth = 0;
  let i = start;
  while (i < src.length) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
    i++;
  }
  return "";
}

describe("R168 — in-diff search debounce (perf optimization)", () => {
  it("DIFF_SEARCH_DEBOUNCE_MS constant exists (150ms)", () => {
    const src = readSrc(APP_TS);
    expect(src).toContain("DIFF_SEARCH_DEBOUNCE_MS");
    expect(src).toMatch(/DIFF_SEARCH_DEBOUNCE_MS\s*=\s*150\b/);
  });

  it("_pendingDiffSearch timer-handle state exists", () => {
    const src = readSrc(APP_TS);
    expect(src).toContain("let _pendingDiffSearch");
  });

  it("runSearch wraps findMatchesInDiff in a setTimeout with the debounce constant", () => {
    const src = readSrc(APP_TS);
    const body = extractRunSearchBody(src);
    expect(body).toContain("findMatchesInDiff");
    expect(body).toContain("setTimeout");
    expect(body).toContain("DIFF_SEARCH_DEBOUNCE_MS");
    expect(body).toMatch(/clearTimeout\(_pendingDiffSearch\)/);
  });

  it("findMatchesInDiff is wrapped in a setTimeout callback (post-R168), not direct", () => {
    const src = readSrc(APP_TS);
    const body = extractRunSearchBody(src);
    // The pre-R168 code had `diffSearch.matchElements = findMatchesInDiff(q);`
    // as a direct statement inside runSearch. Post-R168 it's inside the
    // setTimeout callback. Verify the wrapped form exists.
    const setTimeoutPattern =
      /setTimeout\([\s\S]*?findMatchesInDiff\(q\)[\s\S]*?,\s*DIFF_SEARCH_DEBOUNCE_MS\s*\)/;
    expect(body).toMatch(setTimeoutPattern);
  });
});
