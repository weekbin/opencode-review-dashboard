// R165: regression test for R164 → R165 #87 fix (drawer Resolve now routes
// through showResolveReasonModal). R164 e2e walkthrough found the drawer's
// Resolve button called resolveFinding() directly with no modal + no await.
// R165 fix: await showResolveReasonModal then await resolveFinding — same
// pattern as the conversation panel at app.ts:4669-4686.
//
// This test locks in the NEW behavior. If a future refactor reverts to the
// direct-call pattern, this test will FAIL.

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

const APP_TS = "src/ui/app.ts";

function extractFindingsRootClickHandler(src: string): string {
  const start = src.indexOf('findingsRoot.addEventListener("click"');
  if (start < 0) return "";
  const end = src.indexOf("});", start);
  if (end < 0) return "";
  return src.slice(start, end);
}

describe("R165 — R164 #87 drawer Resolve modal routing (post-fix behavior lock-in)", () => {
  it("findingsRoot click handler is now async (R165 #87 fix)", () => {
    const src = readFileSync(APP_TS, "utf-8");
    const handler = extractFindingsRootClickHandler(src);
    expect(handler).toMatch(/findingsRoot\.addEventListener\("click",\s*async\s*\(/);
  });

  it("handler routes data-resolve buttons through showResolveReasonModal (R165 #87 fix)", () => {
    const src = readFileSync(APP_TS, "utf-8");
    const handler = extractFindingsRootClickHandler(src);
    expect(handler).toContain("button[data-resolve]");
    expect(handler).toContain("await showResolveReasonModal(id)");
    expect(handler).toContain("await resolveFinding(id,");
  });

  it("handler no longer calls resolveFinding() directly (R164-pre behavior, must NOT return)", () => {
    const src = readFileSync(APP_TS, "utf-8");
    const handler = extractFindingsRootClickHandler(src);
    expect(handler).not.toMatch(/resolveFinding\(id\);\s*$/m);
  });
});
