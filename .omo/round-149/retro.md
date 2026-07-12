# R149 Retro — delete 16 orphan i18n keys + add orphan-detection regression test

## What worked

Lead-direct housekeeping round. 1 src file modified (`i18n.ts`) + 1 existing test update (i18n.test.ts) + 1 new test file (r149-i18n-orphan-audit.test.ts) + 1 housekeeping append.

Closes an implicit hygiene flag: i18n.ts had accumulated 17 true orphans (keys declared but never called from production code). After R149 deletion + restoration of 2 inadvertently-deleted production-caller keys, only 1 orphan remains (`sidebar.allFiles`, intentionally kept because r112 test guards it as documentation of a planned-but-unshipped feature).

Pre-commit ran clean after fixing 2 cross-round repairs:
1. **i18n.test.ts L91-95**: the `{token}` placeholder test used `status.copiedPermalink` as the example key. R149 deleted that orphan key, breaking the test. Updated to use `view.stats.locked.ago.minutes` (existing key with `{n}` placeholder) — same behavior contract.
2. **R149 first implementation inadvertently deleted 2 production-caller keys** (`submit.footprint.files` and `submit.footprint.categories`) when removing the larger `submit.footprint.*` block. Caught by R103 coverage gate. Restored.

Both repairs happened in the same commit (atomic), so the SHIP commit is clean.

The new R149 audit test (`r149-i18n-orphan-audit.test.ts`) catches future orphans at pre-commit. Uses 4 reference patterns (more comprehensive than R103's single-pattern scan):
1. `t("...")` direct lookup (R103's pattern)
2. `data-i18n[-title|-placeholder|-aria-label]="..."` HTML attribute
3. `i18nKey: "..."` property assignment
4. `return { ok: false, error: "..." }` raw string return

Whitelist allows 1 test-guarded key (`sidebar.allFiles`) so the test doesn't fail for documented-but-unshipped features.

Profile cadence shift: 12 polish + 2 housekeeping + 1 refactor → 12 polish + 3 housekeeping + 1 refactor. Restores some profile balance after R147/R148 polish streak.

## What didn't

- **Block-level deletions in i18n.ts can hide individual-key callers.** The R149 audit confirmed each orphan before deletion, but a later batch deleted a multi-key block including 2 keys with production callers. Caught by R103 gate. Lesson: when deleting a block of related keys, audit the surrounding context (not just the target keys).
- **Initial R149 test regex tried `[\s\S]*?\}`** which stops at the first `}` — but that pattern was correct since `i18n.ts` is one-line entries. Worked first try, but the multi-segment keys (`submit.footprint.files`) had a different regex requirement than single-segment keys (`a.b`). Test pattern worked.

## Carry-over list (≤3 items)

None — R149 closes the implicit i18n.ts hygiene flag. No new loop-internal flags.

## Closed in this round (loop-internal)

- **Implicit i18n.ts hygiene flag**: closed. 16 orphan keys deleted. 1 test-guarded key kept. 2 production-caller keys restored (caught by R103).

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **R103 audit only checks `t("...")` pattern.** That's a strict invariant (catches missing keys) but doesn't catch `data-i18n="..."`, `i18nKey: "..."`, or `return { error: "..." }` patterns. R149 closes this gap with a 4-pattern audit. Future polish rounds adding new i18n keys should consider which pattern they're using and ensure it's covered.
- **The audit pattern itself is the audit.** When auditing a surface, the audit script should be captured as a permanent regression test (not just run-and-forget). R149 ships the audit script as `r149-i18n-orphan-audit.test.ts` so future orphan keys get caught at pre-commit.
- **Block-level deletions in i18n.ts are risky.** When deleting a multi-key block, the audit should also check that the surrounding context (keys immediately before/after) doesn't have production callers that might be deleted accidentally. Caught by R103 in this round, but could be prevented by a stricter delete pattern (key-by-key with verification, not block-by-block).
- **Per-SHIP append discipline held for 13 rounds** (R134 retro caught the gap; R135–R149 all restored).
- **R149 audit found an implicit loop-internal flag**: i18n.ts hygiene. Not explicitly listed in any prior retro, but visible from the 17-orphan count. Future retros should explicitly check "are there implicit hygiene flags I've been deferring?"

## Risks Surfaced (not actioned this round)

- **`fallbackCopy` ClipboardItem API migration** (R137-R148 retro #1, 12 rounds shelved): real behavior change. Future refactor round.
- **3 server-side i18n-coupling system markers** (R142-R148 retro #3, 7 rounds shelved): invasive. Future feature round.

## v6 Compliance

- Hard caps: **0 features** (≤3) + **0 bugfixes** (≤5) + **0 polish** (≤1) + **1 housekeeping** = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.
- R103 i18n coverage invariant honored — every `t("X.Y")` call has a matching key.

## Round Profile

- Housekeeping: 1 (delete 16 orphan i18n keys + add regression net)
- Total: 1
- Subagents: 0
- Time: ~25 min wall-clock including the 2 cross-round repairs (i18n.test.ts update + submit.footprint.files/.categories restoration).