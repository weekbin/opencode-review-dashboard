// R164 AC3: regression test for R162 #85 (Force Reopen modal opens on click).
// R162 verified the handler at src/ui/app.ts:4706 awaits showReopenReasonModal
// for stale findings. e2e walkthrough in R164 confirmed: click Force Reopen
// → modal opens with title "强制重新打开审查项" → submit POSTs /reopen with
// manually_reopened: true → server returns 200.
// If a future refactor removes the modal or breaks the handler, this test
// catches it.

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

const APP_TS = "src/ui/app.ts";

function extractReopenBtnHandler(src: string): string {
  // Find the reopenBtn click handler. The handler is between
  // `reopenBtn.addEventListener("click", async (event) => {` and its closing `});`
  const start = src.indexOf('reopenBtn.addEventListener("click"');
  if (start < 0) return "";
  const end = src.indexOf("});", start);
  if (end < 0) return "";
  return src.slice(start, end);
}

function extractShowReopenReasonModal(src: string): string {
  // Verify showReopenReasonModal function exists and creates a modal-overlay
  const start = src.indexOf("function showReopenReasonModal");
  if (start < 0) return "";
  const end = src.indexOf("\n}\n", start);
  if (end < 0) return "";
  return src.slice(start, end + 2);
}

describe("R164 — R162 #85 Force Reopen handler regression", () => {
  it("reopenBtn click handler is registered in app.ts", () => {
    const src = readFileSync(APP_TS, "utf-8");
    const handler = extractReopenBtnHandler(src);
    expect(handler.length).toBeGreaterThan(100);
    expect(handler).toContain("event.stopPropagation");
  });

  it("handler awaits showReopenReasonModal for stale findings (isStale branch)", () => {
    const src = readFileSync(APP_TS, "utf-8");
    const handler = extractReopenBtnHandler(src);
    expect(handler).toContain("isStale");
    expect(handler).toContain("await showReopenReasonModal");
    expect(handler).toContain("manually_reopened: true");
  });

  it("showReopenReasonModal function exists and appends to document.body", () => {
    const src = readFileSync(APP_TS, "utf-8");
    const modalFn = extractShowReopenReasonModal(src);
    expect(modalFn).toContain("function showReopenReasonModal");
    expect(modalFn).toContain("document.body.appendChild(overlay)");
  });
});
