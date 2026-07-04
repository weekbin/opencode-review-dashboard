// R105 — loop gap #10 fix: .omo/round-* v6 conformance.
//
// v6 spec: each round commits 6 artifacts (discovery, research, brief, verify,
// retro, decision.md) plus a closed loop-internal. R82-R104 (24 rounds) shipped
// ad-hoc — sometimes with prose-only artifacts, sometimes with SHIP buried in
// longer decision text. this test enforces the structural invariant.
//
// scope: rounds >= R82 only. older rounds (R1-R81) predate v6 and are not in
// scope. a future round may extend the lower bound if the codebase proves stable.

import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

const OMO = ".omo";
const EXPECTED_ARTIFACTS = [
  "discovery.md",
  "research.md",
  "brief.md",
  "verify.md",
  "retro.md",
  "decision.md",
] as const;
const V6_START = 82;

interface RoundDir {
  full: string;
  num: number;
}

function listRoundDirs(): RoundDir[] {
  const entries = readdirSync(OMO, { withFileTypes: true });
  const dirs: RoundDir[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const m = e.name.match(/^round-(\d+)$/);
    if (!m || !m[1]) continue;
    dirs.push({ full: join(OMO, e.name), num: parseInt(m[1], 10) });
  }
  return dirs.sort((a, b) => a.num - b.num);
}

describe("R105 — .omo/round-* v6 conformance (gap #10)", () => {
  it("every v6-era round dir (>= R82) has all 6 expected artifacts", () => {
    const v6 = listRoundDirs().filter((d) => d.num >= V6_START);
    const missing: string[] = [];
    for (const dir of v6) {
      for (const art of EXPECTED_ARTIFACTS) {
        if (!existsSync(join(dir.full, art))) {
          missing.push(`${dir.full}/${art}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("every v6-era decision.md equals SHIP (no longer prose)", () => {
    const v6 = listRoundDirs().filter((d) => d.num >= V6_START);
    const notShipped: string[] = [];
    for (const dir of v6) {
      const path = join(dir.full, "decision.md");
      if (!existsSync(path)) continue;
      const content = readFileSync(path, "utf-8").trim();
      if (content !== "SHIP") {
        notShipped.push(`${path}: ${JSON.stringify(content.slice(0, 60))}`);
      }
    }
    expect(notShipped).toEqual([]);
  });

  it("every v6-era retro.md declares loop-internal closed (none/empty/n-a/-)", () => {
    const v6 = listRoundDirs().filter((d) => d.num >= V6_START);
    const openLoop: string[] = [];
    for (const dir of v6) {
      const path = join(dir.full, "retro.md");
      if (!existsSync(path)) continue;
      const content = readFileSync(path, "utf-8");
      const m = content.match(/loop[ -]internal open:?\s*\n+\s*([^\n#]+)/i);
      if (!m || !m[1]) continue;
      const value = m[1].trim();
      if (value.length === 0) continue;
      const normalized = value.replace(/[.!\s]+$/, "").toLowerCase();
      if (!["none", "empty", "n/a", "-"].includes(normalized)) {
        openLoop.push(`${path}: "${value.slice(0, 80)}"`);
      }
    }
    expect(openLoop).toEqual([]);
  });
});
