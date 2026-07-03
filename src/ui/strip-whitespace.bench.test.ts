// R53 perf bench harness for ignore-whitespace re-render.
// GH#73 #6 perf half: foundation to measure stripWhitespace cost on large diffs.
// Note: renderDiffPanel (src/ui/app.ts:4943) is the suspected bigger bottleneck
// (innerHTML clear + full DOM rebuild per file). Foundation round measures
// stripWhitespace only; renderDiffPanel bench deferred to R54.

import { describe, expect, it } from "bun:test";

const STRIP_REGEX_GLOBAL_WS = /\s+/g;
const STRIP_REGEX_TRAILING = / +$/;

// Mirrors stripWhitespace() in src/ui/app.ts:223.
function stripWhitespace(s: string): string {
  return s.replace(STRIP_REGEX_GLOBAL_WS, " ").replace(STRIP_REGEX_TRAILING, "");
}

function generateRealisticDiff(lines: number): string {
  // ~70% leading indent (4 spaces), ~20% trailing spaces, ~10% tab/space runs.
  const segments: string[] = [];
  for (let i = 0; i < lines; i++) {
    const kind = i % 10;
    if (kind < 7) segments.push(`    line ${i} content here`);
    else if (kind < 9) segments.push(`    line ${i} content   `);
    else segments.push(`\tline\t${i}\twith\ttabs`);
  }
  return segments.join("\n");
}

describe("R53 — stripWhitespace perf bench (foundation for GH#73 #6 perf half)", () => {
  it("5000-line realistic input × 100 iter completes <500ms", () => {
    const input = generateRealisticDiff(5000);

    // Warmup pass — V8 JIT + regex compile cache.
    stripWhitespace(input);

    const start = performance.now();
    let lastResult = "";
    for (let i = 0; i < 100; i++) {
      lastResult = stripWhitespace(input);
    }
    const elapsed = performance.now() - start;

    // Capture baseline data into the test runner output for future rounds.
    console.log(
      `[R53 stripWhitespace bench] input=${input.length}B iter=100 elapsed=${elapsed.toFixed(2)}ms`,
    );

    expect(lastResult.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(500);
  });

  it("10000-line realistic input × 100 iter completes <1500ms (extrapolation)", () => {
    const input = generateRealisticDiff(10000);
    stripWhitespace(input);

    const start = performance.now();
    let lastResult = "";
    for (let i = 0; i < 100; i++) {
      lastResult = stripWhitespace(input);
    }
    const elapsed = performance.now() - start;

    console.log(
      `[R53 stripWhitespace bench 10k] input=${input.length}B iter=100 elapsed=${elapsed.toFixed(2)}ms`,
    );

    expect(lastResult.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(1500);
  });
});
