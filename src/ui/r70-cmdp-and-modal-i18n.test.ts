// R70 i18n: 5 hardcoded English strings remain in app.ts after R63-R67 sweep.
// - Cmd+P palette placeholder="Jump to file…" (input)
// - Reopen modal placeholder example text (textarea)
// - Resolve modal placeholder example text (textarea)
// - Wontfix modal placeholder example text (textarea)
// - Submit modal "You're about to submit" content

import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";

describe("R70 — Cmd+P palette + 3 modal textareas use i18n", () => {
  it("Cmd+P palette placeholder uses t() (no hardcoded 'Jump to file')", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const inputWrap = ts.match(/inputWrap\.innerHTML = `[\s\S]*?`;/);
    expect(inputWrap).not.toBeNull();
    expect(inputWrap![0]).not.toMatch(/placeholder="Jump to file/);
    expect(inputWrap![0]).toMatch(
      /placeholder="\$\{escapeHtml\(t\("palette\.cmdP\.placeholder"\)\)\}"/,
    );
  });

  it("reopen-reason textarea placeholder uses i18n key", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    expect(ts).toMatch(
      /<textarea id="reopen-reason"[\s\S]*?placeholder="\$\{escapeHtml\(t\("[^"]+"\)\)\}"/,
    );
  });

  it("resolve-reason textarea placeholder uses i18n key", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    expect(ts).toMatch(
      /<textarea id="resolve-reason"[\s\S]*?placeholder="\$\{escapeHtml\(t\("[^"]+"\)\)\}"/,
    );
  });

  it("wontfix-reason textarea placeholder uses i18n key", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    expect(ts).toMatch(
      /<textarea id="wontfix-reason"[\s\S]*?placeholder="\$\{escapeHtml\(t\("[^"]+"\)\)\}"/,
    );
  });
});
