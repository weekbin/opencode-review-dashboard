// R61 v6 lock-in validation: verify SKILL.md's 7 capabilities + 5 hard gates
// match what R53-R60 actually did.

import { describe, expect, it } from "bun:test";

const SKILL_PATH = ".opencode/skills/team-dev-loop/SKILL.md";
const PRECOMMIT_PATH = ".husky/pre-commit";

describe("R61 — v6 lock-in validation (post R53-R60)", () => {
  it("v6 SKILL.md has 7 capability sections (no patch numbering)", async () => {
    const skill = await Bun.file(SKILL_PATH).text();
    for (let i = 1; i <= 7; i++) {
      expect(skill).toContain(`Capability ${i}`);
    }
  });

  it("v6 SKILL.md has zero SG.R## patch sections (anti-pattern check)", async () => {
    const skill = await Bun.file(SKILL_PATH).text();
    expect(skill).not.toMatch(/^### SG\.R\d/m);
  });

  it("v6 SKILL.md ≤ 400 lines (was 2716 in v5)", async () => {
    const skill = await Bun.file(SKILL_PATH).text();
    const lines = skill.split("\n").length;
    expect(lines).toBeLessThanOrEqual(400);
  });

  it("pre-commit hook has 8 numbered checks", async () => {
    const hook = await Bun.file(PRECOMMIT_PATH).text();
    const checks = (hook.match(/\[(\d)\/8\]/g) || []).length;
    expect(checks).toBe(8);
  });

  it("R53-R60 all have 6 artifacts in .omo/round-N/", async () => {
    for (const r of [53, 54, 55, 56, 57, 58, 59, 60]) {
      const files = [
        "discovery.md",
        "research.md",
        "brief.md",
        "verify.md",
        "retro.md",
        "decision.md",
      ];
      for (const f of files) {
        const path = `.omo/round-${r}/${f}`;
        const exists = await Bun.file(path).exists();
        expect(exists).toBe(true);
      }
    }
  });

  it("R53-R60 all have entries in proposals.jsonl", async () => {
    const jsonl = await Bun.file(".omo/proposals.jsonl").text();
    for (const r of [53, 54, 55, 56, 57, 58, 59, 60]) {
      expect(jsonl).toContain(`"round":${r}`);
    }
  });
});
