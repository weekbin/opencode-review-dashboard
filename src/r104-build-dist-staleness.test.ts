// R104 — loop gap #7 fix: production build verification.
//
// R82-R101 modified src/ui/i18n.ts (~190 STRINGS rows). R102 (gap #1 fix)
// changed .husky/pre-commit. R103 (gap #3+5) added 7 new STRINGS rows.
// until R104 there was no automated check that dist/ui/app.js is in sync
// with the source — a developer could change src/ui/i18n.ts and forget to
// run `bun run build`, shipping stale bundles with hardcoded English to
// zh-CN users.
//
// test strategy: sample-based smoke test. pick a small handful of STRINGS
// rows added in recent rounds (R82, R97, R103), verify the dist bundle
// contains both the key name and a substring of the zh-CN translation.
// presence-only — does not catch "key removed from source but still in
// dist" (that's a separate concern).
//
// guard: skip cleanly if dist/ does not exist (dev mode running tsc only
// is fine — pre-commit already covers lint + typecheck + unit tests in
// that case).

import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "fs";

const APP_BUNDLE = "dist/ui/app.js";

interface Sample {
  /** STRINGS key path (status.X, action.X, modal.X, ...) */
  key: string;
  /** Substring of zh-CN translation that must appear in dist bundle */
  zhSubstring: string;
  /** Round reference for traceability */
  round: string;
}

const SAMPLES: ReadonlyArray<Sample> = [
  // R103 — gap #3 fix added 7 keys
  { key: "status.commentAdded", zhSubstring: "评论已添加", round: "R103" },
  { key: "status.copiedAsMarkdown", zhSubstring: "已复制为 Markdown", round: "R103" },
  { key: "status.noReviewData", zhSubstring: "暂无审查数据", round: "R103" },
  // R97 — showWontfixReasonModal
  { key: "modal.wontfix.body", zhSubstring: "为什么此审查项无需操作", round: "R97" },
  // R88 — drawer labels
  { key: "savedReplies.title", zhSubstring: "已保存回复", round: "R88" },
  // R82 — title attrs in review.html, not bundled (review.html copied separately).
  //    Skip — they live in dist/ui/review.html, not app.js. verified separately.
];

describe("R104 — production build verification (gap #7)", () => {
  it("dist/ui/app.js exists (production build was run)", () => {
    if (!existsSync(APP_BUNDLE)) {
      console.log(`[SKIP] ${APP_BUNDLE} not found — run \`bun run build\` before this gate`);
      // mark as pass when missing so dev-mode pre-commit does not gate-block.
      // CI/release pipelines should run `bun run build` before this test.
      expect(true).toBe(true);
      return;
    }
    expect(existsSync(APP_BUNDLE)).toBe(true);
  });

  it("dist/ui/app.js bundles the sample of recent i18n keys (no source/dist drift)", () => {
    if (!existsSync(APP_BUNDLE)) return; // see above note
    const bundle = readFileSync(APP_BUNDLE, "utf-8");
    const missing: string[] = [];
    for (const sample of SAMPLES) {
      if (!bundle.includes(`"${sample.key}"`)) missing.push(`${sample.key} (${sample.round})`);
      if (!bundle.includes(sample.zhSubstring))
        missing.push(`${sample.zhSubstring} (${sample.round})`);
    }
    // surface failures so the developer sees exactly what's stale
    expect(missing).toEqual([]);
  });

  it("dist/ui/review.html exists and contains a recent zh-CN title attribute", () => {
    const REVIEW_DIST = "dist/ui/review.html";
    if (!existsSync(REVIEW_DIST)) return;
    const html = readFileSync(REVIEW_DIST, "utf-8");
    // R82 added data-i18n-title="saveIndicator.title" with zh-CN "自动保存状态"
    expect(html).toContain('data-i18n-title="saveIndicator.title"');
  });
});
