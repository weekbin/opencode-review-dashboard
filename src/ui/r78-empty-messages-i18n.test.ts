// R78 i18n: 4 hardcoded English empty/saved messages replaced with t() calls.

import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";

describe("R78 — empty-state / saved-state messages use i18n keys", () => {
  it("Cmd+P palette No files-match uses palette.cmdP.noResults key", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    expect(ts).toMatch(/t\("palette\.cmdP\.noResults"/);
    expect(ts).toMatch(/t\("palette\.cmdP\.empty"\)/);
  });

  it("save indicator 'All changes saved' uses save.indicator.idle (× 2 sites)", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const matches = ts.match(/el\.textContent = t\("save\.indicator\.idle"\);/g) || [];
    expect(matches.length).toBe(2);
  });

  it("commits pane 'No commits match' uses commits.empty.noResults", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    expect(ts).toMatch(/t\("commits\.empty\.noResults"/);
    expect(ts).toMatch(/t\("commits\.empty\.empty"\)/);
  });

  it("conversation pane 'No findings match' uses conversation.empty.noResults", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    expect(ts).toMatch(/t\("conversation\.empty\.noResults"/);
  });
});
