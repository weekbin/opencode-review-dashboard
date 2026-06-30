/**
 * R20 #40 — Sidebar review progress helper unit tests.
 *
 * Multi-round ACs (AC1.1–AC1.5 sidebar progress) require deterministic
 * assertions on the function that builds the counter payload — per
 * R12 loop-decision.md, MR ACs MUST use direct unit tests on the
 * `formatReviewProgress()` helper. Single-round harness cannot verify
 * multi-round ACs.
 *
 * The text itself is composed by `t()` in `app.ts`, so this file stays
 * hermetic (no i18n, no DOM).
 *
 * Covers:
 *   - AC1.1: payload exposes count / total / percent matching the
 *     `formatReviewProgress(readCount, totalCount)` contract
 *   - AC1.3: widthPct equals the rounded percent (visual bar width)
 *   - Edge cases: 0/0, 0/Y, Y/Y, readCount > totalCount, NaN inputs
 */

import { describe, expect, it } from "bun:test";

import { formatReviewProgress } from "./review-progress";

describe("AC1.1 — formatReviewProgress exposes count/total/percent", () => {
  it("returns the expected payload for typical inputs", () => {
    expect(formatReviewProgress(5, 12)).toEqual({
      count: 5,
      total: 12,
      percent: 42,
      widthPct: "42%",
      complete: false,
    });
    expect(formatReviewProgress(3, 4)).toMatchObject({
      count: 3,
      total: 4,
      percent: 75,
      complete: false,
    });
    expect(formatReviewProgress(7, 10)).toMatchObject({
      count: 7,
      total: 10,
      percent: 70,
    });
  });

  it("rounds 1/3 up to 33% (Math.round behavior, not floor)", () => {
    const r = formatReviewProgress(1, 3);
    expect(r.count).toBe(1);
    expect(r.total).toBe(3);
    expect(r.percent).toBe(33);
  });

  it("rounds 2/3 down to 67%", () => {
    const r = formatReviewProgress(2, 3);
    expect(r.percent).toBe(67);
  });

  it("rounds 1/8 to 13% and 5/8 to 63% (Math.round boundary)", () => {
    expect(formatReviewProgress(1, 8).percent).toBe(13);
    expect(formatReviewProgress(2, 8).percent).toBe(25);
    expect(formatReviewProgress(3, 8).percent).toBe(38);
    expect(formatReviewProgress(5, 8).percent).toBe(63);
  });
});

describe("AC1.3 — widthPct feeds the visual progress bar", () => {
  it("widthPct string equals `${percent}%`", () => {
    const r = formatReviewProgress(4, 9);
    expect(r.widthPct).toBe(`${r.percent}%`);
  });

  it("widthPct is exactly '100%' when complete", () => {
    const r = formatReviewProgress(12, 12);
    expect(r.widthPct).toBe("100%");
  });

  it("widthPct is exactly '0%' when no files are reviewed", () => {
    const r = formatReviewProgress(0, 12);
    expect(r.widthPct).toBe("0%");
  });
});

describe("edge cases — defensive normalization", () => {
  it("0/0 returns zeroed payload (nothing to review yet)", () => {
    const r = formatReviewProgress(0, 0);
    expect(r.count).toBe(0);
    expect(r.total).toBe(0);
    expect(r.percent).toBe(0);
    expect(r.widthPct).toBe("0%");
    expect(r.complete).toBe(false);
  });

  it("0/Y (nothing reviewed yet) shows 0%", () => {
    const r = formatReviewProgress(0, 12);
    expect(r.count).toBe(0);
    expect(r.total).toBe(12);
    expect(r.percent).toBe(0);
    expect(r.complete).toBe(false);
  });

  it("Y/Y (all reviewed) marks complete with 100%", () => {
    const r = formatReviewProgress(12, 12);
    expect(r.count).toBe(12);
    expect(r.total).toBe(12);
    expect(r.percent).toBe(100);
    expect(r.complete).toBe(true);
  });

  it("readCount > totalCount clamps to 100% (defensive)", () => {
    // Should not throw; should clamp to 100%.
    const r = formatReviewProgress(20, 12);
    expect(r.count).toBe(12);
    expect(r.total).toBe(12);
    expect(r.percent).toBe(100);
    expect(r.widthPct).toBe("100%");
    expect(r.complete).toBe(true);
  });

  it("NaN inputs collapse to zero", () => {
    const r = formatReviewProgress(Number.NaN, Number.NaN);
    expect(r.count).toBe(0);
    expect(r.total).toBe(0);
    expect(r.percent).toBe(0);
  });

  it("negative inputs are clamped to zero", () => {
    const r = formatReviewProgress(-3, 10);
    expect(r.count).toBe(0);
    expect(r.total).toBe(10);
    expect(r.percent).toBe(0);
  });
});

describe("AC1.2 — readCount matches state.read.size growth pattern", () => {
  // Simulates the toggleRead path: as reviewer marks more files, the
  // counter must grow monotonically and stay <= totalCount.
  it("monotonic growth from 0 → total returns correct percents", () => {
    const samples = [
      [0, 10, 0],
      [1, 10, 10],
      [5, 10, 50],
      [9, 10, 90],
      [10, 10, 100],
    ] as const;
    for (const [read, total, expectedPercent] of samples) {
      const r = formatReviewProgress(read, total);
      expect(r.count).toBe(read);
      expect(r.total).toBe(total);
      expect(r.percent).toBe(expectedPercent);
    }
  });
});

describe("AC1.5 — STRINGS export shape is independent of this helper", () => {
  // This module deliberately does not touch i18n — translation lives in
  // app.ts via t('sidebar.reviewProgress', {count,total,percent}). The
  // dedicated STRINGS regression test for the new key lives in
  // `i18n.test.ts` (added as part of the SG.R19.3 STRINGS_USAGE_PLAN).
  it("helper has no i18n imports", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const path = join(import.meta.dir, "review-progress.ts");
    const src = readFileSync(path, "utf8");
    expect(src).not.toMatch(/from\s+["']\.\/i18n["']/);
  });
});
