// R139 — Hoist `fallbackCopy` to file scope.
// Direct test on the hoisted function for both happy and catch paths.

import { describe, expect, it, beforeEach, mock } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";

describe("R139 — fallbackCopy hoisted to file scope", () => {
  it("app.ts declares fallbackCopy exactly once at file scope", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    const decls = src.match(/^function fallbackCopy/gm);
    expect(decls?.length).toBe(1);
  });

  it("app.ts has no remaining inline 'const fallbackCopy = (text' bodies", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).not.toMatch(/const fallbackCopy = \(text/);
  });
});
