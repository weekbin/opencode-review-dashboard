// R67 badge tooltips i18n: 3 hardcoded English strings in app.ts
// - L3658: range-banner close button aria-label="Dismiss"
// - L4343: edited badge title "Edited by user at ..." (in dynamic innerHTML)
// - L4352: resolution-kind badge title "Resolution: ..." (in dynamic innerHTML)

import { describe, expect, it } from "bun:test";

const APP_TS_PATH = "src/ui/app.ts";
const I18N_TS_PATH = "src/ui/i18n.ts";

describe("R67 — conversation badges + range-banner close use i18n", () => {
  it("range-banner close button uses t() for aria-label (no hardcoded 'Dismiss')", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const bannerBlock = ts.match(/banner\.innerHTML = `[\s\S]*?banner\.querySelector\("\.close"\)/);
    expect(bannerBlock).not.toBeNull();
    expect(bannerBlock![0]).not.toMatch(/aria-label="Dismiss"/);
    expect(bannerBlock![0]).toMatch(/aria-label="\$\{escapeHtml\(t\("[^"]+"\)\)\}"/);
  });

  it("edited-badge title uses t() (no hardcoded 'Edited by user at')", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const editedBlock = ts.match(/<span class="badge badge-edited"[\s\S]*?<\/span>/);
    expect(editedBlock).not.toBeNull();
    expect(editedBlock![0]).not.toMatch(/title="Edited by user at/);
    expect(editedBlock![0]).toMatch(/title="\$\{escapeHtml\(t\("badge\.edited\.tooltip"/);
  });

  it("resolution-kind badge title uses t() (no hardcoded 'Resolution:')", async () => {
    const ts = await Bun.file(APP_TS_PATH).text();
    const resBlock = ts.match(/<span class="badge badge-resolution-[\s\S]*?<\/span>/);
    expect(resBlock).not.toBeNull();
    expect(resBlock![0]).not.toMatch(/title="Resolution:/);
    expect(resBlock![0]).toMatch(/title="\$\{escapeHtml\(t\("badge\.resolution\.tooltip"/);
  });
});
