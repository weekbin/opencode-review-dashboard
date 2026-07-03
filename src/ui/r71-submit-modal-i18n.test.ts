// R71 i18n: submit modal (app.ts:5874) has 7 hardcoded English strings.
// Modal has: h3 "Submit review?", p "You're about to submit...",
// p "open finding N will be submitted.", label "Round notes (...)",
// placeholder "Optional global notes...", button "Cancel", button "Submit".

import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";

describe("R71 — submit modal uses i18n for all 7 hardcoded English strings", () => {
  it("submit modal HTML template uses t() for h3 title", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = ts.match(/submit-confirm-modal[\s\S]*?submit-confirm-ok[\s\S]*?<\/button>/);
    expect(block).not.toBeNull();
    expect(block![0]).not.toMatch(/<h3>Submit review\?<\/h3>/);
  });

  it("submit modal HTML template uses i18n key for body paragraph", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = ts.match(/submit-confirm-modal[\s\S]*?submit-confirm-ok[\s\S]*?<\/button>/);
    expect(block).not.toBeNull();
    expect(block![0]).not.toMatch(/You're about to submit your review\./);
    expect(block![0]).toMatch(/submit\.(?:modal|confirm)\.body/);
  });

  it("submit modal uses i18n key for round-notes label", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = ts.match(/submit-confirm-modal[\s\S]*?submit-confirm-ok[\s\S]*?<\/button>/);
    expect(block).not.toBeNull();
    expect(block![0]).not.toMatch(/Round notes \(appear in next round's/);
  });

  it("submit modal uses i18n key for round-notes placeholder", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = ts.match(/submit-confirm-modal[\s\S]*?submit-confirm-ok[\s\S]*?<\/button>/);
    expect(block).not.toBeNull();
    expect(block![0]).not.toMatch(/placeholder="Optional global notes/);
  });

  it("submit modal buttons use i18n keys (no hardcoded 'Cancel'/'Submit')", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const block = ts.match(/submit-confirm-modal[\s\S]*?submit-confirm-ok[\s\S]*?<\/button>/);
    expect(block).not.toBeNull();
    expect(block![0]).not.toMatch(/<button[^>]*>Cancel<\/button>/);
    expect(block![0]).not.toMatch(/<button[^>]*>Submit<\/button>/);
  });
});
