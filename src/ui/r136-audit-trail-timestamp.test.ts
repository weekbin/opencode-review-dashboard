// R136 — localize audit-trail timestamps.
// Closes the R135 retro "Risks Surfaced" item: audit-trail entries used
// `new Date(row.at).toLocaleString()` which is system-locale dependent and
// inconsistent with the rest of the conversation panel (which uses the
// R134-introduced formatRelativeTime helper).

import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";

describe("R136 — localize audit-trail timestamps", () => {
  it("app.ts renders audit-trail ts via formatRelativeTime", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    const idx = src.indexOf("audit-ts");
    expect(idx).toBeGreaterThan(-1);
    const window = src.slice(Math.max(0, idx - 3000), idx + 800);
    expect(window).toMatch(/const ts = formatRelativeTime\(row\.at\)/);
  });

  it("app.ts no longer calls new Date(row.at).toLocaleString()", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).not.toMatch(/new Date\(row\.at\)\.toLocaleString\(\)/);
  });

  it("audit-ts span still wraps ts via escapeHtml (future-proof)", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).toMatch(/audit-ts">\$\{escapeHtml\(ts\)\}/);
  });
});
