import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/index.ts";

describe("R152 — close R151 contextHash carry-over (regression net)", () => {
  it("src/index.ts no longer declares a function named contextHash", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).not.toMatch(/^function\s+contextHash\b/m);
    expect(src).not.toMatch(/\bcontextHash\s*\(/);
  });

  it("src/index.ts contentMatches() body uses fnv1a() for content-hash comparison (R152: retired contextHash, contentMatches is the actual implementation)", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    const contentMatchesMatch = src.match(/function\s+contentMatches\([\s\S]*?\n\}/);
    expect(contentMatchesMatch).not.toBeNull();
    const body = contentMatchesMatch![0];
    // Auto-resolve mechanism: fnv1a compares each anchor field
    const fnv1aCount = (body.match(/fnv1a\(/g) ?? []).length;
    expect(fnv1aCount).toBeGreaterThanOrEqual(6); // 3 prev + 3 next
  });
});
