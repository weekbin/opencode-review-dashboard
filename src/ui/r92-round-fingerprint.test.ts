// R163 #4: regression test for R162 #92 (round counting cross-branch bug).
// R162 added a fingerprint comparison (base.diff_base.type + from vs
// data.diff_base.type + from) in the /submit handler so that switching
// diff_base resets round to 1 instead of `base.round + 1`. Without this fix,
// the user reported "round 9 → round 4 after cross-branch diff" data
// corruption.

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

const INDEX_TS = "src/index.ts";

function extractSubmitRoundBlock(src: string): string {
  // Find the block between `if (intent === "approve" && notes.length === 0)`
  // and the first `const findings` line.
  const startMatch = src.match(
    /if\s*\(intent\s*===\s*"approve"\s*&&\s*notes\.length\s*===\s*0\)\s*\{/,
  );
  if (!startMatch || startMatch.index === undefined) return "";
  const start = startMatch.index + startMatch[0].length;
  const end = src.indexOf("const findings", start);
  if (end < 0) return "";
  return src.slice(start, end);
}

describe("R163 — R162 #92 round counting fingerprint regression", () => {
  it("/submit handler declares the fingerprint comparison (R162 fix)", () => {
    const src = readFileSync(INDEX_TS, "utf-8");
    const block = extractSubmitRoundBlock(src);
    expect(block).toContain("base.diff_base.type");
    expect(block).toContain("data.diff_base.type");
    expect(block).toContain("baseFromFingerprint");
    expect(block).toContain("dataFromFingerprint");
  });

  it("round is computed as `sameDiffBase ? base.round + 1 : 1` (R162 fix)", () => {
    const src = readFileSync(INDEX_TS, "utf-8");
    const block = extractSubmitRoundBlock(src);
    expect(block).toMatch(/round\s*=\s*sameDiffBase\s*\?\s*base\.round\s*\+\s*1\s*:\s*1/);
  });
});
