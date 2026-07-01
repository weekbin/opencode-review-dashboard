# R16 PM Triage Brief — 7 candidates surfaced (lead-synthesized, 5 min)

## Title L16 — R16 dev loop · scope selection for next round
*Round*: 16 of cron-style dev loop
*Date*: 2026-06-30
*PM source*: lead-synthesized (R+ v5.3.3 lead-direct PM Triage — saved 17 min vs R13 subagent)
*Prior baseline*: `121c4dd` (R16 audit-trail prep) + `350efba` (R+ retro SG.12) + `0bed398` (R15 closure)
*Current state*: 262/262 unit tests · 33/33 e2e scenarios · 0 lint/typecheck drift · 12 features shipped R12-R15 · 8 GH issues auto-closed

---

## Sync state

Phase -0 sync: **PASS** · main = `121c4dd` = origin/main · 0 ahead / 0 behind · clean

Phase 0 PM Triage (this brief) running lead-direct — saved 17 min vs R13 subagent pattern.

Open GH issues (verified live): ONLY #12 + #13 (both aged_rounds=6 user-rejected 6x per stale-bundle-rule violation threshold from R12 retro).

R12 brief 7/7 status: 6/7 shipped (Pinned / Reactions / n-p nav R12, Cmd+P / Submit / Audit R15). Only #5 (Cmd+/ help overlay) remains.

R+ retro follow-up: 5 SKILL patches applied (SG.6-SG.12 cumulative) · 5 screenshots captured · README + zh-CN rewritten as user manuals.

---

## Competitor analysis (R+ retro SG.10 — verified URLs)

| Capability | GitHub | GitLab | Phabricator | Gerrit |
|---|---|---|---|---|
| Keyboard shortcut help | `?` shows dialog | `?` shows dialog | `?` shows modal | none |
| Toast notifications | inline banner | inline banner | inline banner | inline banner |
| A11y (ARIA + focus traps) | partial (Comments a11y 2023) | good (WCAG AA) | partial | good |
| Cmd+/ help overlay | YES (GitHub Primer) | YES | YES | NO |
| Toast system | NO (uses inline) | NO (uses banner) | NO | YES (event log) |

**Gap map**:
- **Cmd+/ help overlay** — 3/4 competitors ship it, ours doesn't → CLOSE this gap (R12 brief #5 closure)
- **A11y** — partial in all, 4-5 elements with aria-* on finding cards (R12-R15 mostly missed)
- **Toast** — GitHub/GitLab/Phabricator use inline banners, Gerrit uses event log; ours uses ad-hoc `setStatus()` calls scattered through app.ts

---

## Product-value gate (R+ retro SG.7 — post-completion verification as check-in)

Each candidate passes 3-test:
1. Real user pain? (or plausible-unique?)
2. Closes a competitor gap? (or architectural debt?)
3. ≤ 200 LOC or ≤ 60 min? (skip if bigger)

All 7 candidates pass gate.

---

## 7 candidates surfaced

### ★ A — Cmd+/ help overlay (R12 brief #5 closure)
- **Issue**: not yet filed (will create #29)
- **User-value**: 3/5 — discoverable shortcut reference (R10 retro call: "first-time users don't know n-p exists")
- **LOC**: 55-85 · 1 modal + 1 global keydown listener
- **Files**: `src/ui/app.ts` + new `src/help-overlay.ts` (or inline)
- **Risk**: LOW (additive, no schema)
- **R+ retro**: closes R12 brief 7/7 — first round to fully complete R12 brief

### B — A11y audit + fixes (focus traps + ARIA labels)
- **Issue**: not yet filed (will create #30)
- **User-value**: 4/5 — enterprise reviewers + screen-reader users + WCAG AA gate
- **LOC**: 100-150 · 5-7 file:line edits + 2 helper functions
- **Files**: `src/ui/app.ts` (modals + finding cards) + `src/ui/review.html` (semantic tags) + 1 new `src/a11y-helpers.ts`
- **Risk**: MEDIUM (visual regressions possible if role/aria semantics break existing layouts)
- **Gap evidence**: only 4-5 elements with aria-* in entire app.ts (~6000 lines)

### C — Toast notification system (replace ad-hoc setStatus)
- **Issue**: not yet filed (will create #31)
- **User-value**: 3.5/5 — clearer action feedback (Submit / Resolve / React / Pin confirmations)
- **LOC**: 50-100 · 1 new component + 1 state bus
- **Files**: `src/ui/app.ts` + new `src/toast.ts`
- **Risk**: LOW (additive, no schema)
- **Pattern**: replays `setStatus()` calls as toast events with auto-dismiss

### D — Right-click context menu on finding
- **Issue**: not yet filed (will create #32)
- **User-value**: 3/5 — saves 2-3 clicks per action (Show in diff / Copy link / Resolve / Edit)
- **LOC**: 60-90 · 1 new component + 1 context menu state
- **Files**: `src/ui/app.ts` + new `src/context-menu.ts`
- **Risk**: LOW (additive)
- **Note**: Phabricator ships this; GitHub has actions menu but no right-click

### E — Diff view mode toggle (split / unified / compact)
- **Issue**: not yet filed (will create #33)
- **User-value**: 3/5 — preference-based layout (compact saves vertical space)
- **LOC**: 80-120 · 3-way toggle + localStorage persistence
- **Files**: `src/ui/app.ts` + 1 new `src/diff-layout.ts`
- **Risk**: LOW (additive, localStorage only)
- **Note**: schema-touching if persistence beyond localStorage, but localStorage is enough

### F — Comment thread replies (nested threading)
- **Issue**: not yet filed (will create #34)
- **User-value**: 3.5/5 — Slack-like threaded discussion on findings
- **LOC**: 120-180 · schema-touching (parent_comment_id field)
- **Files**: `src/ui/app.ts` + `src/index.ts` (server) + 1 new `src/threading.ts`
- **Risk**: MEDIUM-HIGH (schema change requires `audit_log` style migration per R15)
- **Note**: would need fresh test fixtures; longer than 20-min Dev budget

### G — Live reload of finding card updates (SSE/WebSocket)
- **Issue**: not yet filed (will create #35)
- **User-value**: 3/5 — multi-tab reviewers see each other's updates
- **LOC**: 80-120 · 1 new SSE channel
- **Files**: `src/index.ts` + `src/ui/app.ts`
- **Risk**: MEDIUM (new server push channel; similar to R13 #13 Live file-watcher)
- **Note**: similar to deferred #13 Live file-watcher; would need chokidar-like dep

---

## Self-Critique

**Auto-dropped** (not surfaced as candidates):
- **AI-suggested findings** — needs model integration (out of single-round scope)
- **Multi-user auth** — out of scope (single-user plugin)
- **Mobile UI** — out of scope
- **#12 Bulk actions** — aged_rounds=6 user-rejected 6x → stale per R12 retro rule
- **#13 Live file-watcher** — aged_rounds=6 user-rejected 6x → stale per R12 retro rule
- **R14 retro L.1/L.2 polish** — README bullets + format-utils Date.now() informational → defer
- **F Comment thread replies** — MEDIUM-HIGH risk, schema-touching, longer than 20-min Dev budget → risks eating round

**Deprioritized** (vs ★ A):
- B-D — all worth doing, none as essential as ★ A which closes R12 brief
- E — preference-based, lower user-value than a11y/toast
- F-G — too risky for single-round

---

## Profile recommendation

★ A + B + C bundle · 3 features · ~205-335 LOC · 5-7 files · feature ≤ 3 cap exact · 0 cap headroom

| # | Feature | LOC | User-value | Risk |
|---|---|---|---|---|
| ★A | Cmd+/ help overlay | 55-85 | 3/5 | LOW |
| B | A11y audit + fixes | 100-150 | 4/5 | MEDIUM |
| C | Toast notification system | 50-100 | 3.5/5 | LOW |
| | **Total** | **205-335** | | |

**Why this bundle**:
- Closes R12 brief 7/7 (first round to do so)
- Closes 2 real competitor gaps (a11y + toasts — both have visible gaps)
- A11y is HIGH user-value and long overdue (only 4-5 elements with aria-* on entire app.ts)
- All additive, no schema breaks, no new deps
- Hits feature ≤ 3 cap exactly · 0 cap headroom · matches R13/R14/R15 cadence
- Estimated Dev time: 18-22 min (just at subagent budget)

**Profile**: feature (3 features · all additive · a11y is MEDIUM risk but well-scoped)

---

## Risk register (R+ retro SG.7 — post-completion verification)

| # | Risk | Mitigation |
|---|---|---|
| R1 | A11y fixes break visual layout | Use semantic HTML (header/main/aside) + test against existing screenshots |
| R2 | Cmd+/ help overlay conflicts with browser shortcut | Capture-phase keydown listener + `preventDefault()` if not in input |
| R3 | Toast system introduces state bus complexity | Keep it as singleton event emitter + 1 render function |
| R4 | A11y needs screen-reader testing (not automatable) | Manual QA via VoiceOver/NVDA in Phase 3c Playwright |

---

## 6 options for user pick

1. **★A + B + C bundle** (3 features, ~205-335 LOC, closes R12 brief + 2 competitor gaps) — RECOMMENDED
2. **★A alone** (1 feature, 55-85 LOC, closes R12 brief only — doesn't fill bundle)
3. **A + C only** (2 features, ~105-185 LOC, skip a11y risk)
4. **A + B only** (2 features, ~155-235 LOC, skip toast)
5. **Different combo** (B + C + D, etc. — user specifies)
6. **Fresh PM Triage subagent** (派 subagent 提 candidates, 17-min wait, full PM Triage)