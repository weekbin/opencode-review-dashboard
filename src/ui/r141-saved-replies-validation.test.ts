// R141 — Localize `addSavedReply()` validation errors.
// Closes the hardcoded English validation errors in addSavedReply() that R140
// missed (R140 closed the parallel `data?.error ?? t(...)` fetch-error pattern;
// this round closes the `result.error ?? t(...)` validation-error pattern).

import { describe, expect, it } from "bun:test";

const I18N_TS_PATH = "src/ui/i18n.ts";
const APP_TS_PATH = "src/ui/app.ts";
const REQUIRED_KEYS = [
  "savedReplies.error.nameRequired",
  "savedReplies.error.bodyRequired",
  "savedReplies.error.softCap",
  "savedReplies.error.quotaExceeded",
] as const;

const I18N_KEY_RE = (key: string): RegExp =>
  new RegExp(`"${key.replace(/\./g, "\\.")}":\\s*\\{[\\s\\S]*?en:[\\s\\S]*?"zh-CN":`);

describe("R141 — localize addSavedReply validation errors", () => {
  it("i18n.ts declares all 4 new savedReplies.error keys with en + zh-CN", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    for (const key of REQUIRED_KEYS) {
      expect(src).toMatch(I18N_KEY_RE(key));
    }
  });

  it("savedReplies.error.softCap uses {n} placeholder for the cap number", async () => {
    const src = await Bun.file(I18N_TS_PATH).text();
    const block = src.match(/"savedReplies\.error\.softCap":\s*\{[\s\S]*?\}/);
    expect(block?.[0]).toContain("{n}");
  });

  it("addSavedReply returns translation keys (not hardcoded English) for all 4 errors", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    const fnBlock = src.match(/function addSavedReply\([\s\S]*?return \{ ok: true \};\s*\}/);
    expect(fnBlock).toBeTruthy();
    expect(fnBlock![0]).not.toMatch(/"name is required"/);
    expect(fnBlock![0]).not.toMatch(/"body is required"/);
    expect(fnBlock![0]).not.toMatch(/localStorage quota exceeded/);
    expect(fnBlock![0]).not.toMatch(/soft cap reached \(/);
    expect(fnBlock![0]).toMatch(/error: "savedReplies\.error\.nameRequired"/);
    expect(fnBlock![0]).toMatch(/error: "savedReplies\.error\.bodyRequired"/);
    expect(fnBlock![0]).toMatch(/error: "savedReplies\.error\.softCap"/);
    expect(fnBlock![0]).toMatch(/error: "savedReplies\.error\.quotaExceeded"/);
  });

  it("caller wraps result.error with t() before setStatus", async () => {
    const src = await Bun.file(APP_TS_PATH).text();
    expect(src).toMatch(
      /setStatus\(result\.error \? t\(result\.error\) : t\("status\.templateSaveFailed"\), true\)/,
    );
  });
});
