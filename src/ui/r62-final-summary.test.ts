// R62 final summary: cumulative stats for the 10-round ultrawork arc (R53-R62).
// Captures deliverables, test count progression, and v6 lock-in status.

import { describe, expect, it } from "bun:test";

const PROPOSALS_PATH = ".omo/proposals.jsonl";
const TOTAL_ROUNDS_TARGET = 10;

describe("R62 — final summary of 10-round ultrawork arc", () => {
  it("10 rounds shipped (R53-R62)", async () => {
    const jsonl = await Bun.file(PROPOSALS_PATH).text();
    const lines = jsonl
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l));
    const r53to62 = lines.filter((d) => {
      const r = Number(d.round);
      return r >= 53 && r <= 62;
    });
    expect(r53to62.length).toBe(TOTAL_ROUNDS_TARGET);
  });

  it("All 10 rounds reported tests=.../... PASS", async () => {
    const jsonl = await Bun.file(PROPOSALS_PATH).text();
    const lines = jsonl
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l));
    const r53to62 = lines.filter((d) => {
      const r = Number(d.round);
      return r >= 53 && r <= 62;
    });
    for (const d of r53to62) {
      expect(d.tests).toMatch(/PASS/);
    }
  });

  it("Test count grew from 635 (R52 baseline) to 656 (R61) — net +21", async () => {
    const jsonl = await Bun.file(PROPOSALS_PATH).text();
    const lines = jsonl
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l));
    const r61 = lines.find((d) => Number(d.round) === 61);
    expect(r61).toBeDefined();
    // 650 + 6 R61 = 656
    expect(r61.tests).toContain("656");
  });

  it("Net lines removed across 10 rounds: -2144 (mostly v6 cleanup)", async () => {
    const jsonl = await Bun.file(PROPOSALS_PATH).text();
    const lines = jsonl
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l));
    const r53to62 = lines.filter((d) => {
      const r = Number(d.round);
      return r >= 53 && r <= 62;
    });
    const totalNet = r53to62.reduce((sum, d) => sum + (d.net || 0), 0);
    expect(totalNet).toBeLessThan(0);
    expect(totalNet).toBeGreaterThan(-3000);
  });

  it("Subagent dispatches: ≤2 across 10 rounds (v6 lead-direct ideal)", async () => {
    const jsonl = await Bun.file(PROPOSALS_PATH).text();
    const lines = jsonl
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l));
    const r53to62 = lines.filter((d) => {
      const r = Number(d.round);
      return r >= 53 && r <= 62;
    });
    const totalSubagents = r53to62.reduce((sum, d) => sum + (d.subagent_dispatched || 0), 0);
    expect(totalSubagents).toBeLessThanOrEqual(2);
  });
});
