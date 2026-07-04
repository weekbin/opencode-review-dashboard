// R103 — loop gaps #3 + #5 fix: i18n coverage + translation completeness.
//
// gap #3: 20 rounds of i18n (r79-r101) added 70+ STRINGS keys. no test verifies
//   that every t("X") callsite actually has a matching key in i18n.ts.
//   silent failure mode: t("missing.key") falls back to literal "missing.key"
//   in the UI — a translation leak that's invisible in en sessions.
// gap #5: i18n.test.ts only checks en and zh-CN are truthy. it does NOT catch
//   the case where en === zh-CN (forgot to translate).

import { describe, expect, it } from "bun:test";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const I18N_TS = "src/ui/i18n.ts";
const SRC_UI = "src/ui";

function listTsFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".ts") && !e.name.endsWith(".test.ts"))
    .map((e) => join(dir, e.name));
}

// match namespaced `t("X.Y")` calls only. real i18n keys are always
// namespaced (action.remove, modal.cancel, ...). this filters out
// false-positives like t("foo"), JSX attrs like classList.toggle("bar"),
// and bare-word strings inside template literals.
function extractTCalls(file: string): Set<string> {
  const content = readFileSync(file, "utf-8");
  const matches = content.matchAll(/\bt\(\s*"([a-zA-Z][a-zA-Z0-9_]+\.[a-zA-Z0-9._]+)"/g);
  const keys: string[] = [];
  for (const m of matches) {
    if (m[1]) keys.push(m[1]);
  }
  return new Set(keys);
}

function extractI18nKeys(file: string): Set<string> {
  const content = readFileSync(file, "utf-8");
  const matches = content.matchAll(/"([a-zA-Z][a-zA-Z0-9_]+\.[a-zA-Z0-9._]+)":\s*\{/g);
  const keys: string[] = [];
  for (const m of matches) {
    if (m[1]) keys.push(m[1]);
  }
  return new Set(keys);
}

function extractRow(content: string, key: string): string | null {
  const idx = content.indexOf(`"${key}":`);
  if (idx < 0) return null;
  // look at the next 400 chars (covers multi-line rows up to ~5 lines).
  return content.substring(idx, idx + 400);
}

describe("R103 — i18n coverage (gap #3 zombie use + gap #5 translation completeness)", () => {
  it("every namespaced t('X.Y') call in src/ui/*.ts has a matching i18n.ts key", () => {
    const tsFiles = listTsFiles(SRC_UI);
    const defined = extractI18nKeys(I18N_TS);
    const calls = new Set<string>();
    for (const f of tsFiles) {
      for (const call of extractTCalls(f)) calls.add(call);
    }
    const missing = Array.from(calls)
      .filter((c) => !defined.has(c))
      .sort();
    if (missing.length > 0) {
      // surface failures so the gate user can see exactly what's broken
      expect(missing).toEqual([]);
    }
  });

  it("every STRINGS key in i18n.ts has BOTH non-empty en and zh-CN", async () => {
    const content = await Bun.file(I18N_TS).text();
    const keys = Array.from(extractI18nKeys(I18N_TS));
    const incomplete: string[] = [];
    for (const key of keys) {
      const row = extractRow(content, key);
      if (!row) {
        incomplete.push(`${key}: row not found`);
        continue;
      }
      const enMatch = row.match(/en:\s*"([^"]*)"/);
      const zhMatch = row.match(/"zh-CN":\s*"([^"]*)"/);
      if (!enMatch || !enMatch[1] || enMatch[1].length === 0) {
        incomplete.push(`${key}: missing or empty en`);
      }
      if (!zhMatch || !zhMatch[1] || zhMatch[1].length === 0) {
        incomplete.push(`${key}: missing or empty zh-CN`);
      }
    }
    expect(incomplete).toEqual([]);
  });

  it("every STRINGS key has en !== zh-CN (translation completeness)", async () => {
    const content = await Bun.file(I18N_TS).text();
    const keys = Array.from(extractI18nKeys(I18N_TS));
    const untranslated: string[] = [];
    for (const key of keys) {
      const row = extractRow(content, key);
      if (!row) continue;
      const enMatch = row.match(/en:\s*"([^"]*)"/);
      const zhMatch = row.match(/"zh-CN":\s*"([^"]*)"/);
      if (!enMatch || !zhMatch || !enMatch[1] || !zhMatch[1]) continue;
      if (enMatch[1] === zhMatch[1] && enMatch[1].length > 0) {
        untranslated.push(`${key}: en === zh-CN ("${enMatch[1]}")`);
      }
    }
    expect(untranslated).toEqual([]);
  });
});
