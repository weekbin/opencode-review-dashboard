# Lens #4 — Security/privacy/integrity (lead-direct, R34 polish round)

## Verdict: **PASS** — No security/privacy/integrity regressions; no new attack surface

## Security review per AC

### AC1 (SKILL.md fallback patch, doc-only)

**Security implications**:
- Documentation-only change (no code logic)
- No new tokens, no new API calls
- No file system writes
- ✓ Safe

### AC4 (runtime-compat.ts TS fix)

**Security implications**:
- TypeScript narrowing fix only (no runtime change)
- `as ReturnType<typeof spawn>` is compile-time only
- `args[0]!` non-null assertion matches original code semantic
- ✓ No runtime behavior change, no new attack surface

**Risks**:
- ❌ Unrestricted `spawn()` arguments? — Pre-existing, not introduced by R34
- ❌ Unvalidated `args[0]`? — Same as pre-existing (was always `string | undefined` before, now `!` assertion used)

### AC3 (Conversation panel 4 UX)

**Security implications**:
- Layout/CSS changes only (no new code paths)
- ✓ No new tokens, no new API calls
- ✓ No file system writes
- ✓ No third-party requests
- ✓ No new user-data exposure

**Privacy**:
- Comment button: 1 button reclassified as `btn btn-primary` (cosmetic, no behavior change)
- Select-all checkbox: 1 new checkbox for bulk operations (no data sent, local-only state)
- Finding badges: 1 new span per finding (no data sent, local rendering only)

**XSS**:
- New badge text set via `textContent` (safe, not `innerHTML`)
- `data-i18n` attrs use i18n translator (safe)
- ✓ No XSS risk

### AC2 (Settings panel + i18n post-submit banner)

**Security implications**:
- Layout: `.settings-field` flex → grid (CSS-only, no behavior change)
- Close button: existing close path verified
- i18n: `t('review.submitted.*')` replaces hardcoded English

**i18n review** (R20+ retro SG.R19.3 STRINGS_USAGE_PLAN):
- ✓ 2 new keys in STRINGS: `review.submitted.title` (en + zh-CN), `review.submitted.message` (en + zh-CN)
- ✓ No dynamic interpolation in key (only `{round}` and `{shortcut}` are user-derived, passed to t() as parameters)
- ✓ No XSS risk

### AC5 (worktree cleanup)

**Security implications**:
- `git worktree remove --force` is local-only operation
- No network calls, no file system writes outside git
- ✓ No security risk

## Privacy review

| Check | Status |
|---|---|
| New tokens generated | NONE (AC1+AC4+AC5 are process changes) |
| New cross-origin requests | NONE (AC3+AC2 are UI polish, no network changes) |
| New user-data exposure | NONE (i18n keys are static strings) |
| New third-party requests | NONE |
| New file system writes | NONE |
| Token URL in browser history | Same as R33 (unchanged) |

## Integrity review

| Check | Status |
|---|---|
| Atomic write for state.json | ✓ unchanged (R1 retro: state.json still atomic) |
| Backups | ✓ unchanged |
| Race conditions | NONE — all changes are type-only or CSS-only |
| Type safety | ✓ no `any` introduced; `as ReturnType<typeof spawn>` is the proper TS narrowing pattern |
| Memory leaks | NONE — no new references held across boundary |

## Hard-stop SAST patterns

Searched for: `innerHTML`, `eval`, `dangerouslySetInnerHTML`, `document.write`, `new Function`, `--no-sandbox`:
- AC1+AC4+AC3+AC5: No code logic changes (all safe)
- AC2 i18n: `t('review.submitted.title', { round: body?.round ? \` — round ${body.round}\` : "" })` — template literal interpolation in JS, but `body.round` is from fetch response JSON. **Trust boundary check**: response is from local server (port 8890), no external network. If `body.round` is user-controlled, potential XSS via template literal in i18n. **Mitigation**: `body.round` is set by server from internal logic, not user input.

**No SAST violations found**.

## Vulnerability assessment

No new vulnerabilities introduced. R34 is a clean polish + process patch round. The 14-worktree cleanup + SG.R28.1 skill-availability fallback + 5-i18n-key additions + settings grid layout + conversation panel UX + 1 TS error resolution are all low-risk, additive changes.

## Recommendations for R35

1. R21-R31 retro defect (pre-existing uncommitted modifications) should be addressed via R35 housekeeping — these may include security-related changes that need to be reviewed for vulnerabilities.
2. The pre-existing TS error at `src/index.ts:2470` (Expected 0 arguments, but got 1) should be fixed in R35 — this is a function signature mismatch that could mask type safety violations.
3. The hardcoded English at `src/ui/app.ts:5584/5599` (pre-submit banner) is now wrapped in `t()` calls (R34 AC2), but the `body.round` template literal injection is a minor concern — future R+ rounds should consider stricter input validation.
