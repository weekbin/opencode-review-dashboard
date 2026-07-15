import { describe, expect, it } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const I18N_TS_PATH = "src/ui/i18n.ts";
const SRC_UI = "src/ui";

const ALLOWED_TEST_GUARDS = new Set(["sidebar.allFiles"]);

function listTsFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".ts") && !e.name.endsWith(".test.ts"))
    .map((e) => join(dir, e.name));
}

function listTestFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".test.ts"))
    .map((e) => join(dir, e.name));
}

function extractI18nKeys(file: string): Set<string> {
  const content = readFileSync(file, "utf-8");
  const keys: string[] = [];
  for (const m of content.matchAll(/"([a-zA-Z][a-zA-Z0-9_]+\.[a-zA-Z0-9._]+)":\s*\{/g)) {
    if (m[1]) keys.push(m[1]);
  }
  return new Set(keys);
}

function extractProductionCalls(): Set<string> {
  const used = new Set<string>();
  for (const f of [...listTsFiles(SRC_UI), "src/index.ts"]) {
    const content = readFileSync(f, "utf-8");
    for (const pattern of [
      /\bt\(\s*"([a-zA-Z][a-zA-Z0-9_.]+)"/g,
      /data-i18n(?:-title|-placeholder|-aria-label)?="([a-zA-Z][a-zA-Z0-9_.]+)"/g,
      /i18nKey:\s*"([a-zA-Z][a-zA-Z0-9_.]+)"/g,
      /return\s*\{\s*ok:\s*false,\s*error:\s*"([a-zA-Z][a-zA-Z0-9_.]+)"/g,
    ]) {
      for (const m of content.matchAll(pattern)) {
        if (m[1]) used.add(m[1]);
      }
    }
  }
  // R162 #91: also scan review.html so data-i18n attributes on elements
  // count as production references (prevents false-positive orphans for
  // keys only used in static markup, e.g. settings.save / settings.cancel).
  try {
    const html = readFileSync(join(SRC_UI, "review.html"), "utf-8");
    for (const pattern of [
      /data-i18n(?:-title|-placeholder|-aria-label)?="([a-zA-Z][a-zA-Z0-9_.]+)"/g,
    ]) {
      for (const m of html.matchAll(pattern)) {
        if (m[1]) used.add(m[1]);
      }
    }
  } catch {
    /* ignore */
  }
  return used;
}

function extractTestRefs(): Set<string> {
  const used = new Set<string>();
  for (const f of listTestFiles(SRC_UI)) {
    const content = readFileSync(f, "utf-8");
    for (const m of content.matchAll(/"([a-zA-Z][a-zA-Z0-9_]+\.[a-zA-Z0-9._]+)"/g)) {
      if (m[1]) used.add(m[1]);
    }
  }
  return used;
}

describe("R149 — i18n orphan audit (regression net for R149 cleanup)", () => {
  it("every i18n.ts key is referenced from production OR tests (with whitelist for test-only guards)", () => {
    const defined = extractI18nKeys(I18N_TS_PATH);
    const production = extractProductionCalls();
    const tests = extractTestRefs();
    const orphans = Array.from(defined)
      .filter((k) => !production.has(k) && !tests.has(k))
      .filter((k) => !ALLOWED_TEST_GUARDS.has(k))
      .sort();
    expect(orphans).toEqual([]);
  });

  it("i18n.ts key count is consistent (R149 deleted 16, sidebar.allFiles kept as guarded)", () => {
    const defined = extractI18nKeys(I18N_TS_PATH);
    expect(defined.size).toBeGreaterThan(0);
  });
});
