# Lens #4 — Security/privacy/integrity (lead-direct)

## Verdict: **PASS** — No security/privacy/integrity regressions

## Security review per AC

### AC1 — port fix

**Security implications**:
- Port 8890 is hardcoded; no input from user. ✓ No injection risk
- EADDRINUSE fallback doesn't expose any new attack surface. Falls back to OS-assigned port via `port: 0`
- Browser opens `http://127.0.0.1:8890/...?token=...`. URL is local-only — no public exposure
- Token-based auth unchanged — same model as before

**Risks**:
- **Port collision**: If another app on user's machine uses 8890, plugin warns + falls back. User can manually adjust if needed (no UI toggle, but warning is visible)
- **Token still in URL**: `http://127.0.0.1:8890/review/abc?token=xyz` — log files or browser history may capture token. Pre-existing concern, NOT introduced by R33.

### AC2 — status: "open" schema

**Schema integrity**:
- Adding `status: "open"` is **additive** — existing data files without this field may default to undefined
- Pre-existing filter `(f) => f.status === "open" || f.status === "closed_auto"` evaluates `undefined === "open"` → false → NOT matched

**Risk for users with pre-R33 state**:
- New findings (added by R33 code path) get `status: "open"` ✓
- Pre-R33 findings (if any persisted in user's state.json) would be `status: undefined`
  - Submit counter would show 0 for these (pre-R33+post-R33 state mismatch)
  - **Mitigation**: Not a real risk because `state.fresh` is "in-round new findings" — they were just created in the current round. Pre-R33 sessions end with fresh=[] on submit. Pre-R33 fresh findings don't survive across sessions anyway.

**Data integrity**: ✓ No data loss risk. Existing pre-R33 behavior unchanged.

### AC3 — post-submit overlay

**Privacy**:
- Overlay shows "Review submitted — round N". Round number is user-visible but pre-existing.
- Add `<kbd>⌘W</kbd> / <kbd>Ctrl+W</kbd>` instruction is informational, not security-sensitive.

**Visual integrity**:
- New visibility: hidden + z-index 3000 + backdrop means content below is COMPLETELY HIDDEN — user can't see what's behind the modal
- **Improvement over R32** (which had partial transparency showing 0.3 opacity content — that was a privacy leak — R33 fixes it)

### AC4 — Ignore-ws i18n

**Privacy**:
- Adding more i18n keys = no data exposure. Pure local strings.

**XSS**:
- The 3 new strings (en + zh-CN, 6 total) are static constants. No user input flows into them.
- Button text is set via `textContent` (safe, not innerHTML). aria-label set via `setAttribute` (safe).
- ✓ No XSS risk

## Privacy review

| Check | Status |
|---|---|
| New tokens generated | NONE (AC1 doesn't change token mechanism) |
| New cross-origin requests | NONE (still 127.0.0.1) |
| New user-data exposure | NONE |
| New third-party requests | NONE |
| New file system writes | NONE |

## Integrity review

| Check | Status |
|---|---|
| Atomic write for state.json | ✓ unchanged (R1 retro: state.json still atomic) |
| Backups | ✓ unchanged |
| Race conditions | EADDRINUSE catch handles concurrent server binding |
| Type safety | ✓ no `any` introduced |
| Memory leaks | NONE — no new references held across boundary |

## Hard-stop SAST patterns

Searched for: `innerHTML`, `eval`, `dangerouslySetInnerHTML`, `document.write`, `new Function`, `--no-sandbox`:
- AC4 uses `setAttribute("aria-label", t("..."))` — safe
- AC3 CSS changes only — safe
- AC1 try/catch pattern — safe
- AC2 `state.fresh.push({...})` — adds typed field, safe

**No SAST violations found.**

## Vulnerability assessment

No new vulnerabilities introduced. R33 is a pure bugfix/polish round.
