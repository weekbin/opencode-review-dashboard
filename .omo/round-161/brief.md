# R161 Brief — [USER ISSUE #3] 截图修复 + 补充缺失的 R16 图

## Scope (single commit)

1. **Re-create 3 missing R16 images** (`r16-diff-toolbar.png`, `r16-hide-whitespace-on.png`, `r16-conversation-copy-as-md.png`)
2. **Re-capture 3 description-mismatch images** (`dashboard-overview.png`, `r12-conversation-with-finding.png`, `r13-in-diff-search.png`)
3. **Re-capture 2 README image variants** (`r15-s1-conversation-pinned-sort.png`, `r15-s4-submit-confirm.png`)
4. **Update README EN + ZH** to fix 2 description-mismatch alt texts (r16-diff-toolbar, r13-in-diff-search)

## Files affected

- `docs/screenshots/dashboard-overview.png` (rewrite — content fix)
- `docs/screenshots/r12-conversation-with-finding.png` (rewrite)
- `docs/screenshots/r13-in-diff-search.png` (rewrite)
- `docs/screenshots/r15-s1-conversation-pinned-sort.png` (rewrite)
- `docs/screenshots/r15-s4-submit-confirm.png` (rewrite)
- `docs/screenshots/r16-conversation-copy-as-md.png` (re-create)
- `docs/screenshots/r16-diff-toolbar.png` (re-create)
- `docs/screenshots/r16-hide-whitespace-on.png` (re-create)
- `README.md` (2 alt-text fixes)
- `README.zh-CN.md` (2 alt-text fixes)

## Mock-server modifications (temp)

For screenshots, mock-server.py needed:
- 3 files in `files` array (README.md + src/feature.ts + src/utils/helper.ts) for dashboard overview
- `existing_findings: 1` with `reactions: [{emoji, users}]` array format (NOT object) for finding card display
- `prior_rounds: [{round: 1, notes: ...}]` for R137 copy round notes (already done in R160)
- `pinned: true` for R15 Pinned filter
- `locked: {at, round, by}` for R132 lock banner (already done in R160)

**Restored to HEAD before commit.**

## Risk

- **No runtime code change.** Pure visual refresh.
- **No test code change.** 1119/1119 tests still pass (R132-R158 regression coverage unchanged).
- **R8/R13 latent bug** (in-diff search counter always 0) is **out of scope** — would need separate fix round.
- Mock-server changes are temporary and reverted.

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 0 | ≤3 | OK |
| bugfix | 1 (missing 3 R16 + 3 description mismatch) | ≤5 | OK |
| polish | 0 | ≤1 | OK |
| refactor | 0 | n/a | OK |
| housekeeping | 1 (R160 R16 imgs cleanup) | n/a | OK |
| total | 2 | ≤8 | OK |
| subagent | 0 | ≤15min | OK |
| AC/subagent | n/a (lead-direct) | 1 | OK |

## Profile

Bugfix (USER ISSUE #3) + housekeeping. Real user-driven work.