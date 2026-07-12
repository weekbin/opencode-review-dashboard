// R132 — Persistent locked-review status in the Stats pane.
// Given a persisted R131 lock, the launch payload and browser UI must keep it visible after reload.

import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const INDEX_TS = readFileSync(join(import.meta.dir, "index.ts"), "utf8");
const APP_TS = readFileSync(join(import.meta.dir, "ui", "app.ts"), "utf8");
const I18N_TS = readFileSync(join(import.meta.dir, "ui", "i18n.ts"), "utf8");
const REVIEW_HTML = readFileSync(join(import.meta.dir, "ui", "review.html"), "utf8");
const DESIGN_PATH = join(ROOT, "DESIGN.md");
const DESIGN_MD = existsSync(DESIGN_PATH) ? readFileSync(DESIGN_PATH, "utf8") : "";

const SERVER_LAUNCH = INDEX_TS.slice(
  INDEX_TS.indexOf("type Launch = {"),
  INDEX_TS.indexOf("type Done ="),
);
const LAUNCH_PAYLOAD = INDEX_TS.slice(
  INDEX_TS.indexOf("const data: Launch = {"),
  INDEX_TS.indexOf("const map =", INDEX_TS.indexOf("const data: Launch = {")),
);
const CLIENT_LAUNCH = APP_TS.slice(
  APP_TS.indexOf("type Launch = {"),
  APP_TS.indexOf("type Meta ="),
);
const STATS_RENDER = APP_TS.slice(
  APP_TS.indexOf("function renderStatsPane(): void"),
  APP_TS.indexOf("function renderActivePane()"),
);

describe("R132: locked state reaches the browser after reload", () => {
  test("AC1: server Launch type carries the persisted lock marker", () => {
    expect(SERVER_LAUNCH).toMatch(
      /locked\?:\s*\{\s*at:\s*number;\s*round:\s*number;\s*by:\s*"user"\s*\}/,
    );
  });

  test("AC2: launch payload forwards base.locked without synthesizing state", () => {
    expect(LAUNCH_PAYLOAD).toMatch(/locked:\s*base\.locked/);
  });

  test("AC3: browser Launch type mirrors the lock marker", () => {
    expect(CLIENT_LAUNCH).toMatch(
      /locked\?:\s*\{\s*at:\s*number;\s*round:\s*number;\s*by:\s*"user"\s*\}/,
    );
  });
});

describe("R132: Stats pane presents persistent lock status", () => {
  test("AC4: lock status renders before the no-findings early return", () => {
    const lockRead = STATS_RENDER.indexOf("state.data?.locked");
    const emptyReturn = STATS_RENDER.indexOf("findings.length === 0");
    expect(lockRead).toBeGreaterThan(-1);
    expect(emptyReturn).toBeGreaterThan(lockRead);
  });

  test("AC5: lock banner is an announced semantic status", () => {
    expect(STATS_RENDER).toMatch(/className\s*=\s*"stats-lock-status"/);
    expect(STATS_RENDER).toMatch(/setAttribute\("role",\s*"status"\)/);
    expect(STATS_RENDER).toMatch(/setAttribute\("aria-live",\s*"polite"\)/);
  });

  test("AC6: lock banner uses an inline SVG rather than an emoji icon", () => {
    expect(STATS_RENDER).toMatch(
      /const lockIcon\s*=\s*document\.createElementNS\("http:\/\/www\.w3\.org\/2000\/svg",\s*"svg"\)/,
    );
    expect(STATS_RENDER).not.toContain("🔒");
  });

  test("AC7: bilingual copy includes the persisted lock round", () => {
    expect(I18N_TS).toMatch(/"view\.stats\.locked\.heading"[\s\S]*?en:[\s\S]*?"zh-CN":/);
    expect(I18N_TS).toMatch(/"view\.stats\.locked\.detail"[\s\S]*?\{round\}[\s\S]*?\{round\}/);
    expect(STATS_RENDER).toContain('t("view.stats.locked.detail", { round: locked.round })');
  });

  test("AC8: lock banner CSS consumes documented semantic tokens", () => {
    const rule = REVIEW_HTML.match(/\.stats-lock-status\s*\{([\s\S]*?)\}/)?.[1] ?? "";
    expect(rule).toContain("var(--status-success-surface)");
    expect(rule).toContain("var(--status-success-border)");
    expect(rule).toContain("var(--status-success-text)");
  });
});

describe("R132: extracted design system and R131 regression", () => {
  test("AC9: DESIGN.md exists with all seven mandatory sections", () => {
    expect(existsSync(DESIGN_PATH)).toBe(true);
    for (const heading of [
      "## 1. Atmosphere & Identity",
      "## 2. Color",
      "## 3. Typography",
      "## 4. Spacing & Layout",
      "## 5. Components",
      "## 6. Motion & Interaction",
      "## 7. Depth & Surface",
    ]) {
      expect(DESIGN_MD).toContain(heading);
    }
  });

  test("AC10: transient post-submit lock handling remains intact", () => {
    expect(APP_TS).toMatch(/if\s*\(body\.locked\)[\s\S]*?showPostSubmit\([^)]*body\?\.locked\)/);
  });
});
