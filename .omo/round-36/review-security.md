# Lens #4 — Security/privacy/integrity (lead-direct, R36 polish round)

## Verdict: **PASS** — No security/privacy/integrity regressions; no new attack surface

## Security review per AC

### AC1 (i18n skipLink key fix, lead-direct)

**Security implications**:
- 1-char fix: added quotes around `skipLink` key in STRINGS table
- ✓ No runtime behavior change (keys are still strings, test now matches)
- ✓ No new attack surface (test integrity restored)
- ✓ No code path changes

**Privacy**: No user data changes.

### AC2 (Previously discussed tab redesign, subagent)

**Security implications**:
- CSS-only changes (190 LOC, 1 deletion)
- ✓ No JS code changes, no new code paths
- ✓ No new dependencies
- ✓ No new third-party requests
- ✓ No user data exposure

**Privacy**: No user data changes.

### AC3 (Worktree branch copy button, subagent)

**Security implications**:
- Uses existing `navigator.clipboard.writeText` pattern (from `src/ui/app.ts:372`)
- ✓ No new code paths (just exposes existing clipboard pattern)
- ✓ No new dependencies
- ✓ No third-party requests

**Privacy**:
- Copies `state.data.auto_worktree_branch` or `state.data.current_branch` to clipboard
- Branch name is internal data (not user-PII)
- ✓ No new data exposure

## Privacy review

| Check | Status |
|---|---|
| New tokens generated | NONE |
| New cross-origin requests | NONE |
| New user-data exposure | NONE (branch name is internal data) |
| New third-party requests | NONE |
| New file system writes | NONE |
| Token URL in browser history | Same as R35 (unchanged) |

## Integrity review

| Check | Status |
|---|---|
| Atomic write for state.json | ✓ unchanged (R1 retro: state.json still atomic) |
| Backups | ✓ unchanged |
| Race conditions | NONE — all changes are dev-process polish |
| Type safety | ✓ no `any` introduced |
| Memory leaks | NONE — no new references held across boundary |
| Test integrity | ✓ RESTORED (was 606 + 1 fail → 610/610, 0 fail) |
| i18n test coverage | ✓ R21-R31 retro data-i18n mismatch resolved |

## Hard-stop SAST patterns

Searched for: `innerHTML`, `eval`, `dangerouslySetInnerHTML`, `document.write`, `new Function`, `--no-sandbox`:
- AC1: 1-char string change (no SAST implication)
- AC2: CSS-only (no SAST implication)
- AC3: uses existing `navigator.clipboard.writeText` (no SAST implication)
- No new code logic introduced

**No SAST violations found.**

## Vulnerability assessment

No new vulnerabilities introduced. R36 is a clean polish round. Test integrity restored (was 606 + 1 fail → 610/610, 0 fail). The 1 pre-existing test fail was the R21-R31 retro defect (R21-R31 had unquoted key), now resolved.

## Recommendations for R37+

1. Husky v10 migration (R35 retro gap-fix) — investigate if v9 install continues to be deprecated
2. Stale branch refs cleanup (R12-R17 in `refs/heads/`) — these don't block anything but pollute branch list
3. v5.3.12 Patch 2 (auto-lightweight) validation — R37+ small bugfix round should trigger automatically
