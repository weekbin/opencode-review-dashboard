# R149 Brief — remove 17 orphan i18n keys from `src/ui/i18n.ts`

## Scope

Delete 17 truly-orphan i18n keys from `src/ui/i18n.ts` (declared but never called from production source):

| Line | Key | en / zh-CN |
|---|---|---|
| 45 | `toolbar.ignoreWs` | "Ignore ws" / "忽略空白" (replaced by `toolbar.ignoreWs.label/description/ariaLabel/loading`) |
| 122 | `toolbar.reconcile.tooltip` | "Show per-file cross-round reconciliation status" |
| 179 | `summary.silentRound.body` | "0 new findings..." (only `summary.silentRound.heading` is used) |
| 183 | `submit.footprint.body` | "Rough estimate of files..." |
| 199 | `submit.footprint.noFindings` | "No additional findings will be auto-generated." |
| 203 | `settings.submitFootprint.label` | "Show footprint preview" |
| 207 | `settings.submitFootprint.description` | "Display a small banner..." |
| 415 | `fileComments.tooltip` | "File-level findings" |
| 549 | `sidebar.selected` | "Selected" / "已选" |
| 592 | `settings.search.history` | "Recent searches" / "最近搜索" |
| 601 | `save.fresh` | "Saved {seconds}s ago" / "{seconds} 秒前已保存" |
| 624 | `status.copiedPermalink` | "Copied permalink for ..." (only test-invoked) |
| 629 | `status.submitted` | "Submitted" |
| 644 | `status.submitFailed` | "Submit failed" |
| 648 | `status.noChanges` | "No changes to save" |
| 785 | `action.undo` | "Undo" / "撤销" |
| ? | `sidebar.allFiles` | "All working-tree files" (r112 test guards it but no production caller) |

**Skipped** (NOT orphans):
- `savedReplies.error.*` (4 keys) — used as raw string returns in `addSavedReply()` at app.ts:293-301 (R141 design). R141 test guards them.
- `view.stats.firstPass.bucket.*` (4 keys) — used via `i18nKey:` property at app.ts:3752-3755.

**Scope per round hard caps**: housekeeping (≤1 housekeeping slot). No code/test changes beyond deletions.

## Files involved

- `src/ui/i18n.ts` — delete 17 keys × their 2-locale string bodies (~20-30 LOC net deletion)
- `src/ui/r112-out-of-diff.test.ts:L65-70` — if `sidebar.allFiles` is removed, update the test to remove the `expect(i18nSrc.includes('"sidebar.allFiles"'))` assertion. OR keep the key (skipped per audit).

Wait — let me reconsider `sidebar.allFiles`. The r112 test guards it because R112 was a feature round that created this key. The test asserts the key exists. Removing the key without updating the test breaks the test. Two options:
- (a) Keep the key (skip from orphans list)
- (b) Remove the key + update the r112 test to remove the assertion

**Decision**: skip `sidebar.allFiles` (option a). The r112 test guards it as documentation of the feature. Removing the test guard would also remove the documentation. Better to leave it for now and let a future feature round either use the key or remove both.

**Final orphan count**: **16 keys** (after removing `sidebar.allFiles` from the list).

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 0 | ≤3 | OK |
| bugfix | 0 | ≤5 | OK |
| polish | 0 | ≤1 | OK |
| housekeeping | 1 | n/a | OK |
| total | 1 | ≤8 | OK |
| subagent | 0 | ≤15min wall | OK |
| AC/subagent | n/a (lead-direct) | 1 | OK |

## Hardening included

- Append R148 entry to `.omo/proposals.jsonl` (per-SHIP discipline)
- Audit scan runs before delete to confirm no production caller