// R100: 1 setStatus site uses hardcoded English "Expanded all files" / "Collapsed all files"
// Both keys already exist (status.expandedAll, status.collapsedAll).

import { describe, expect, it } from "bun:test";

const APP_TS = "src/ui/app.ts";

describe("R100 — 1 setStatus site uses existing i18n keys", () => {
  it("hardcoded 'Expanded all files' / 'Collapsed all files' removed", async () => {
    const app = await Bun.file(APP_TS).text();
    expect(app).not.toContain('setStatus(expand ? "Expanded all files" : "Collapsed all files");');
  });

  it("uses t() with status.expandedAll/collapsedAll", async () => {
    const app = await Bun.file(APP_TS).text();
    expect(app).toMatch(
      /setStatus\(expand \? t\("status\.expandedAll"\) : t\("status\.collapsedAll"\)\)/,
    );
  });
});
