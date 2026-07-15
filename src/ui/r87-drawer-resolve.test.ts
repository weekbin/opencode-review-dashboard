// R164 AC4: regression test for R162 #87 (drawer resolve behavior).
// R164 e2e walkthrough found: the drawer's Resolve button at app.ts:6652-6658
// calls resolveFinding(id) DIRECTLY (no modal, no await). This is a UX
// inconsistency with the conversation panel which uses showResolveReasonModal.
//
// This test LOCKS IN the current behavior. If a future refactor changes the
// drawer to route through the modal, this test will FAIL — that's intentional,
// forcing the dev to update both the code and the test together.

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

const APP_TS = "src/ui/app.ts";

function extractFindingsRootClickHandler(src: string): string {
  // The findingsRoot click handler is between
  // `findingsRoot.addEventListener("click", (event) => {` and its closing `});`
  // Use the second occurrence (first is for the findings in diff, this one
  // is for the drawer findings list). Actually app.ts has only ONE
  // findingsRoot listener.
  const start = src.indexOf('findingsRoot.addEventListener("click"');
  if (start < 0) return "";
  const end = src.indexOf("});", start);
  if (end < 0) return "";
  return src.slice(start, end);
}

describe("R164 — R162 #87 drawer resolve handler (current behavior lock-in)", () => {
  it("findingsRoot click handler is registered in app.ts", () => {
    const src = readFileSync(APP_TS, "utf-8");
    const handler = extractFindingsRootClickHandler(src);
    expect(handler.length).toBeGreaterThan(100);
  });

  it("handler delegates data-resolve buttons to resolveFinding() directly (no modal)", () => {
    const src = readFileSync(APP_TS, "utf-8");
    const handler = extractFindingsRootClickHandler(src);
    // Locks in current behavior: data-resolve button → resolveFinding(id) without modal
    expect(handler).toContain("button[data-resolve]");
    expect(handler).toContain("resolveFinding(id)");
    // Verify NO modal is shown for drawer resolves (current behavior)
    expect(handler).not.toContain("showResolveReasonModal");
  });
});
