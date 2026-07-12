// R72 i18n: edit-finding modal (app.ts:5410+) has 7 hardcoded English strings.
// h3 "Edit finding", p "Update category...", labels "Category"/"Severity"/"Comment",
// buttons "Cancel"/"Save".

import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";

function extractEditModal(ts: string): string | null {
  const m = ts.match(/function showEditFindingModal[\s\S]*?dialog\.innerHTML = `([\s\S]*?)`;/);
  return m && m[1] !== undefined ? m[1] : null;
}

describe("R72 — edit-finding modal uses i18n for all hardcoded English strings", () => {
  it("edit-finding modal h3 uses t() (no hardcoded 'Edit finding')", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = extractEditModal(ts);
    expect(block).not.toBeNull();
    expect(block!).not.toMatch(/<h3>Edit finding<\/h3>/);
  });

  it("edit-finding modal Category label uses t()", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = extractEditModal(ts);
    expect(block).not.toBeNull();
    expect(block!).not.toMatch(/<label for="edit-category">Category<\/label>/);
    expect(block!).toMatch(/t\("editFinding.categoryLabel"\)/);
  });

  it("edit-finding modal Severity label uses t()", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = extractEditModal(ts);
    expect(block).not.toBeNull();
    expect(block!).not.toMatch(/<label for="edit-severity">Severity<\/label>/);
    expect(block!).toMatch(/t\("editFinding.severityLabel"\)/);
  });

  it("edit-finding modal Comment label uses t()", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = extractEditModal(ts);
    expect(block).not.toBeNull();
    expect(block!).not.toMatch(/<label for="edit-comment">Comment<\/label>/);
    expect(block!).toMatch(/t\("editFinding.commentLabel"\)/);
  });

  it("edit-finding modal Save button uses t()", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = extractEditModal(ts);
    expect(block).not.toBeNull();
    expect(block!).not.toMatch(/<button id="edit-save"[^>]*>Save<\/button>/);
  });
});
