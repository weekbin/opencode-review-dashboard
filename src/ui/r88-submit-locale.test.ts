// R163 #3: regression test for R162 #88 (locale in submit payload).
// R162 added `locale: peekLanguage()` to draftPayload() in src/ui/app.ts so
// the backend can pass the user's UI language to the agent prompt. Without
// this field, the agent defaults to English regardless of UI language.

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

const APP_TS = "src/ui/app.ts";

function extractDraftPayloadBody(src: string): string {
  const m = src.match(/function\s+draftPayload[\s\S]*?\n\}/);
  if (!m || !m[0]) return "";
  return m[0];
}

describe("R163 — R162 #88 draftPayload locale regression", () => {
  it("src/ui/app.ts declares the draftPayload function", () => {
    const src = readFileSync(APP_TS, "utf-8");
    const body = extractDraftPayloadBody(src);
    expect(body.length).toBeGreaterThan(100);
  });

  it("draftPayload body includes locale: peekLanguage() (R162 fix)", () => {
    const src = readFileSync(APP_TS, "utf-8");
    const body = extractDraftPayloadBody(src);
    expect(body).toContain("locale:");
    expect(body).toContain("peekLanguage()");
  });
});
