# R26 Plan — Per-finding "delete from history" (feature) + Bulk delete in conversation tab (polish)

> **Generated**: 2026-06-30 by Architect (lead-direct per v5.3.3)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md + planner.md
> **Branch**: `team-dev-loop-round-26-per-finding-delete-and-conv-bulk-delete`
> **Worktree**: `$HOME/.worktrees/team-dev-loop-round-26`
> **Pre-dev sanity check**: `pwd` MUST = worktree AND `node_modules` must exist (SG.R19.4 + SG.R22.2)
> **v5.3.8 SG.R24.1**: Subagent MUST verify `pwd == worktree` AFTER every Write/Edit (R25 SUCCESS pattern)

## 1. Goal

Close 2 GH issues in 2 atomic commits:
- **#53 Per-finding "delete from history" (feature)** — per-entry delete button in Recent Searches dropdown
- **#54 Bulk delete in conversation tab (polish)** — multi-select checkbox + bulk delete button in Conversation tab

## 2. Non-goals

- NO new dependencies (vanilla DOM)
- NO schema changes (localStorage keys preserved)
- NO R22 #45 Clear button removal (stays as "Clear all")
- NO R25 #48 bulk delete removal (stays as multi-select delete)
- NO existing conversation state changes

## 3. AC trace (acceptance criteria, testable)

### Issue #53 — Per-finding "delete from history" (8 ACs)

| AC | Description | Test type | File |
|---|---|---|---|
| 13.1 | Per-entry delete button visible on each Recent Searches item | unit + DOM | `src/ui/app.ts` |
| 13.2 | Click delete → entry removed from localStorage + dropdown re-renders | unit | `src/ui/app.test.ts` |
| 13.3 | R22 #45 Clear button still works (independent action) | regression | `src/ui/app.test.ts` |
| 13.4 | R25 #48 bulk delete still works (independent action) | regression | `src/ui/app.test.ts` |
| 13.5 | Delete does NOT need ≥1 selected (works on individual entries) | unit | `src/ui/app.test.ts` |
| 13.6 | localStorage: 0 keys added (uses existing diff-review:recent-searches) | inspection | shell |
| 13.7 | i18n: 2 new keys (search.recent.delete + .confirm) | unit | `src/ui/i18n.test.ts` |
| 13.8 | Toast confirmation appears after delete | unit + DOM | `src/ui/app.test.ts` |

### Issue #54 — Bulk delete in conversation tab (6 ACs)

| AC | Description | Test type | File |
|---|---|---|---|
| 12.1 | Per-finding checkbox visible in Conversation tab list | unit + DOM | `src/ui/app.ts` |
| 12.2 | Click checkbox → finding marked selected (state test) | unit | `src/ui/app.test.ts` |
| 12.3 | ≥1 selected → "Delete selected" button visible | unit + DOM | `src/ui/app.test.ts` |
| 12.4 | Click bulk → selected findings removed + re-render | unit | `src/ui/app.test.ts` |
| 12.5 | Conversation state preserved (activeTab, filter, etc.) | regression | `src/ui/app.test.ts` |
| 12.6 | localStorage: 0 keys added (uses existing conversation state) | inspection | shell |

**Total ACs**: 14 (8 + 6)

## 4. Files

### Issue #53 (atomic commit 1)
- `src/ui/app.ts` (modify renderRecentSearches + add per-entry delete button + handler)
- `src/ui/i18n.ts` (2 STRINGS keys: search.recent.delete + .confirm)
- `src/ui/search-history.test.ts` (add per-entry delete unit test)
- 3 file touches, ~120 LOC

### Issue #54 (atomic commit 2)
- `src/ui/app.ts` (modify renderConversationPane + add per-finding checkbox + bulk button)
- `src/ui/i18n.ts` (2 STRINGS keys: conversation.bulkDelete + .selected)
- `src/ui/app.test.ts` OR new file (UI test)
- 3 file touches, ~40 LOC

## 5. Strategy & approach

### #53 — Per-finding delete pattern (extends R25 #48)

**Pattern A (preferred): Add delete button to each Recent Searches item**
```typescript
function renderRecentSearches() {
  for each entry in getRecentSearches():
    item.innerHTML = `
      <span class="search-history-text">${entry}</span>
      <button class="search-history-delete" data-i18n-title="search.recent.delete">×</button>
    `;
    deleteBtn.click handler: `removeRecentSearches([entry])` + showToast(t("search.recent.delete.confirm"))
}
```

**Pattern B: Reuse R25 #48 removeRecentSearches**
- `removeRecentSearches([entry])` removes single entry (already supports array)
- No new localStorage helper needed

### #54 — Bulk delete in conversation pattern (extends R25 #52 sidebar)

**Pattern A (preferred): Add checkbox + bulk button to conversation list**
```typescript
function renderConversationPane() {
  // Existing render code...
  for each finding:
    item.innerHTML = `
      <input type="checkbox" class="conversation-finding-checkbox" data-id="${finding.id}">
      <span class="finding-text">${finding.text}</span>
    `;
  
  // New bulk action toolbar (shown when ≥1 selected)
  if (state.selectedFindings.size > 0) {
    bulkToolbar.innerHTML = `
      <button class="conversation-bulk-delete">${t('conversation.bulkDelete')} (${state.selectedFindings.size})</button>
    `;
  }
}
```

**Pattern B: Reuse R25 #52 sidebar pattern**
- Module-level `Set<string> selectedFindings` (like R25 #52 `selectedFiles`)
- Bulk action handler: remove selected from `state.conversationEntries`

### STRINGS table additions

**Issue #53** (per-finding delete):
- `search.recent.delete` (en: "Delete from history", zh-CN: "从历史中删除")
- `search.recent.delete.confirm` (en: "Removed from history", zh-CN: "已从历史中移除")

**Issue #54** (bulk delete conversation):
- `conversation.bulkDelete` (en: "Delete selected findings", zh-CN: "删除选中的 finding")
- `conversation.selected` (en: "Selected", zh-CN: "已选")

## 6. STRINGS_USAGE_PLAN (mandatory for i18n scope per SG.R19.3 + SG.R22.1)

| Key | en | zh-CN | Used in |
|---|---|---|---|
| `search.recent.delete` | "Delete from history" | "从历史中删除" | Per-entry delete button aria-label |
| `search.recent.delete.confirm` | "Removed from history" | "已从历史中移除" | Toast confirmation |
| `conversation.bulkDelete` | "Delete selected findings" | "删除选中的 finding" | Bulk delete button label |
| `conversation.selected` | "Selected" | "已选" | Selected count badge |

**Total**: 4 keys × 2 locales = 8 STRINGS entries. All required.

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| #53 — break R22 #45 Clear button | AC 13.3 regression test |
| #53 — break R25 #48 bulk delete | AC 13.4 regression test |
| #53 — delete fires unintentionally | Per-entry button only fires on explicit click (not on dropdown open) |
| #54 — break conversation state | AC 12.5 regression test |
| #54 — bulk action deletes wrong findings | Set tracking per finding ID, only delete selected IDs |
| both — out of worktree dir | SG.R19.4 sanity check + SG.R24.1 per-Edit verify |
| both — missing node_modules in worktree | SG.R22.2 symlink from main |
| both — subagent writes to main dir | SG.R24.1 per-Edit `pwd` verification (v5.3.8 SUCCESS in R25) |
| both — malformed commit message | Use heredoc `git commit -F- <<EOF` |
| both — bilingual lockstep silent failure | SG.R22.1 pre-commit `grep -c` verify (apply SG.R25.1 candidate idea) |
| both — R3-style fabricated audit | git cat-file -e on every SHA in Phase 2.5 |

## 8. PASS criteria (Phase 3)

- 14 ACs total: 8 PASS for #53 + 6 PASS for #54 = 14/14
- Phase 3a review-lens × 5 + Phase 3b diff + Phase 3c Playwright (Gap #14 layer): all PASS
- i18n regression-guard test passes with 4 new keys (was 29, target 33)
- Full suite: 580 + ~6 = ~586 pass / 0 fail
- mock-server still serves http://localhost:8890
- dist/ rebuilds successfully (Phase 2.6 SG.R20.1 step 2)
- Pre-commit audit: 2 SHAs verified + 3 fast gates + SG.R22.1 bilingual lockstep verify
- SG.R24.1 per-Edit verification applied (v5.3.8 SUCCESS)
- GH issues #53 + #54 auto-closed by Phase 4.9

## 9. Out-of-scope (deferred to R27+)

- tsc PATH investigation (R22 carryover)
- SG.R25.1 — pre-commit SG.R22.1 verify mandatory gate (R25 retro candidate)
- Any other R+ follow-ups

## 10. References

- brief.md: `.omo/round-26/brief.md`
- R22 #45 Clear button: `src/ui/app.ts` (Clear button at line ~947)
- R25 #48 removeRecentSearches: `src/ui/search-history.ts` (already accepts array of queries)
- R25 #52 sidebar bulk delete pattern: `src/ui/sidebar-bulk.test.ts` + `src/ui/app.ts`
- v5.3.8 SKILL.md: SG.R19.x + SG.R20.1 + SG.R22.x + SG.R24.1 all embedded
- pre-commit-audit-spec.md: SG.R20.1 3-step rebuild protocol