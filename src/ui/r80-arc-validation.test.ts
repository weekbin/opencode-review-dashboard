// R80: validates the 28-round arc (R53-R79) state.
// Validates v6 SKILL.md + pre-commit hook + i18n STRINGS table + .omo/round-* artifacts + proposals.jsonl tracking.

import { describe, expect, it } from "bun:test";
import { join } from "node:path";

const PROJECT_ROOT = process.cwd();

describe("R80 — 28-round arc state validation (R53-R79 SHIPped)", () => {
  it("SKILL.md is v6 (≤ 450 lines, 7 capabilities, 0 SG.R## patches)", async () => {
    const skill = await Bun.file(`${PROJECT_ROOT}/.opencode/skills/team-dev-loop/SKILL.md`).text();
    const lines = skill.split("\n").length;
    expect(lines).toBeLessThanOrEqual(450);
    expect(lines).toBeGreaterThanOrEqual(150);
    for (let i = 1; i <= 7; i++) {
      expect(skill).toContain(`Capability ${i}`);
    }
    expect(skill).not.toMatch(/^### SG\.R\d/m);
  });

  it("pre-commit hook has 8 numbered checks", async () => {
    const hook = await Bun.file(`${PROJECT_ROOT}/.husky/pre-commit`).text();
    const checks = (hook.match(/\[(\d)\/8\]/g) || []).length;
    expect(checks).toBe(8);
  });

  it("i18n STRINGS table has ≥ 100 keys (R53 baseline + R57-R79 i18n additions)", async () => {
    const i18n = await Bun.file(`${PROJECT_ROOT}/src/ui/i18n.ts`).text();
    const realKeys = (i18n.match(/"[a-z][a-zA-Z0-9_.]+":\s*\{(?!\/\/)/g) || []).filter(
      (k) => !k.includes('"#') && !k.includes('"//'),
    );
    expect(realKeys.length).toBeGreaterThanOrEqual(100);
  });

  it(".omo/ round directories exist for R53-R79 (most of the 27 rounds in arc 2)", async () => {
    const fs = await import("fs/promises");
    let found = 0;
    for (let r = 53; r <= 79; r++) {
      try {
        const stat = await fs.stat(`${PROJECT_ROOT}/.omo/round-${r}`);
        if (stat.isDirectory()) found++;
      } catch {
        // missing — OK for some rounds
      }
    }
    // 27 rounds in arc 2; expect ≥ 24 of them to have .omo/round-N/ artifacts
    expect(found).toBeGreaterThanOrEqual(24);
  });

  it("proposals.jsonl has 27+ v6-format round entries (R53-R79)", async () => {
    const jsonl = await Bun.file(`${PROJECT_ROOT}/.omo/proposals.jsonl`).text();
    let v6Count = 0;
    for (const line of jsonl.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const obj = JSON.parse(trimmed);
        if (
          typeof obj === "object" &&
          obj !== null &&
          typeof obj.round === "number" &&
          typeof obj.scope === "string"
        ) {
          v6Count++;
        }
      } catch {
        // skip old-format entries
      }
    }
    expect(v6Count).toBeGreaterThanOrEqual(27);
  });
});
