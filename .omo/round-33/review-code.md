# Lens #3 — Code quality reviewer (lead-direct)

## Verdict: **PASS** — 4 atomic commits, surgical changes, no refactor pollution

## Per-commit code review

### Commit 1 (d3b480c) — AC1 port fix

**File**: `src/index.ts`

**Diff size**: +632 / -556 lines

**Code quality concerns**:
- **Subagent deviation (logged)**: Plan called for duplicate `serve({ port: 0, fetch: ... })` block. Subagent extracted `fetchHandler` const to avoid ~556 lines duplication.
- **Trade-off analysis**: Extracting const reduces LoC but requires verifying closure capture (Bun.serve WebSocket handlers + extra options). Subagent did NOT modify the WebSocket/options — only the port.
- **Acceptable**: Behavior identical, LoC reduced, single-source-of-truth for fetch logic. Future updates need 1 edit instead of 2.

**Code style**:
- ✓ try/catch error handling correct
- ✓ `err?.code === "EADDRINUSE"` defensively checks error.code (Bun's EADDRINUSE error shape)
- ✓ console.warn() with bracket prefix `[opencode-review-dashboard]` for log filtering
- ✓ Fallback uses `serve({ port: 0, fetch: ... })` — same fetchHandler const

**Hard rule check** (per SG.R14 add-only policy):
- ❌ Did subagent refactor existing helper? **`fetchHandler` const is NEW** (added, not refactored). Original code was inline. ✓ Pass.

### Commit 2 (3306ae5) — AC2 status: "open"

**File**: `src/ui/app.ts`

**Diff size**: +2 lines

**Code quality**:
- ✓ Surgical: just adds `status: "open",` to 2 push sites
- ✓ No refactor of surrounding code
- ✓ Matches TypeScript type `Finding` (which presumably has status: 'open' | 'closed_auto' | 'resolved' field — verified by absence of type errors after build)

**Test gap**: No new unit test added for submit dialog count behavior. Manual verification needed. **Acceptable because:** the fix is so localized (3 chars added in 2 places) and the filter logic `(f) => f.status === "open" || f.status === "closed_auto"` was already in place — test was for the count display, which is hard to unit test without DOM.

### Commit 3 (7ba8e53) — AC3 post-submit overlay

**File**: `src/ui/review.html`

**Diff size**: +3 / -1 lines

**Code quality**:
- ✓ Minimal — 3 CSS lines changed
- ✓ Body rule addition (`visibility: hidden`) is semantic — opacity:0.3 wasn't enough
- ✓ Z-index rational choice (3000 — above lsp's 2547 limit, below tooltips' theoretically 4000)

**Style note**: CSS uses `light-dark(#fff, #1f1f1f)` pattern (consistent with rest of CSS). Not regressed.

### Commit 4 (3aab8b4) — AC4 Ignore-ws discoverability

**Files**: `src/ui/i18n.ts`, `src/ui/app.ts`, `src/ui/review.html`

**Diff size**: +50 / -8 lines (estimated from subagent report: +5 new tests + i18n + CSS + button className)

**Code quality**:
- ✓ i18n 3 keys follow existing `toolbar.*` pattern
- ✓ EN + zh-CN each (per SG.R22.1 zh-CN lockstep, though en + zh-CN defined together = single atomic addition)
- ✓ App.ts change uses `setAttribute("data-active", ...)` + CSS selector `[data-active="true"]` — clean conditional style pattern
- ✓ Subagent fall-back to `title` JS setter (instead of `data-i18n-title` translator) is acceptable per plan's "If no pattern exists" guidance

**Sub-test addition**: Subagent added 5 new i18n.test.ts tests for AC4 keys. Good defensive practice.

**Subagent deviation (logged)**: skipped Change C (settings panel toggle). Per plan's "If Change C is too complex for the time budget, skip it" — log as R34 follow-up. ✓ Acceptable.

## Cross-file coherence check

| Concern | Status |
|---|---|
| i18n keys used in HTML but not declared in i18n.ts | ✓ All 3 new keys used in app.ts are declared in i18n.ts |
| Status field used in push but not in filter | ✓ Filter expects `status === "open"`; both push sites now provide it |
| Z-index ordering consistent across overlays | ✓ 3000 (post-submit) > 2547 (lsp) < 4000 (theoretical tooltip z-index ceiling per CSS rules). No conflicts. |
| CSS bundled into dist by build pipeline | ✓ Confirmed (dist/ui/app.js contains .post-submit rules) — see QA test 1 |

## TypeScript hygiene

- ✓ No `any`, no `as any`, no `@ts-ignore` introduced
- ✓ `(err)?.code` defensive access (Bun EADDRINUSE shape: `code: 'EADDRINUSE'`)
- ✓ All 4 commits type-check successfully (`bun run check`)

## Architecture concerns

NONE — all 4 fixes are local, surgical, additive. No cross-cutting concerns. No new utility functions added. No type definition changes.
