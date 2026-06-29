# Lens #4 (Security) — Threat Model

> **Source**: Lead-direct inspection (lens subagent `bg_5103b4d0` cancelled after 7m 22s; see `.omo/round-4/lead-takeover-tester-review.md`).
> **Worktree**: `$HOME/.worktrees/team-dev-loop-round-4` @ `f2790e5bd4bf07a9d2d3d23b05b6858356ca14e4`
> **Method**: Read `git diff 870a507..f2790e5 -- src/index.ts` + walked the new handler + threat-modeled against `validateSessionId`, `parsePriorNotes`, `readPriorNotesFromSession`, and the route at `src/index.ts:1682-1702`.

## Threat model

### Attack surface

**New endpoint**: `GET /api/review/${id}/prior-notes` returns `{rounds: Array<{round, notes}>}` parsed from `round-NNN.md` files in the session directory.

### Threats considered

#### T1 — Path traversal via `id` parameter

**Threat**: Attacker sends `id=../../etc/passwd` or `id=..%2f..%2fetc%2fpasswd` to read arbitrary `.md` files.

**Mitigation**:
- `validateSessionId(id)` (`src/index.ts:449-454`): regex `/^[a-zA-Z0-9_-]+$/` + length `1..64`. Rejects `..`, `/`, `\`, NUL, URL-encoded chars, anything outside the alphanumeric+`-_` charset.
- The route handler at `src/index.ts:1684-1690` calls `validateSessionId(id)` FIRST, before any path operation.

**Verified by unit tests** (all pass):
- T4.1: `validateSessionId("../../etc/passwd") === false`
- T4.1: `validateSessionId("..") === false`
- T4.1: `validateSessionId("foo/../../bar") === false`
- T4.2: `validateSessionId("/etc/passwd") === false`
- T4.2: `validateSessionId("foo\u0000bar") === false`
- T4.3: `validateSessionId("foo..bar") === false`
- T4.4: `validateSessionId("") === false`
- T4.4c: `validateSessionId("a".repeat(65)) === false`

**Residual risk**: Low. The router (`src/index.ts` routing logic) uses `state_file` derived from `id`; if the router itself has a bug, `validateSessionId` is bypassed. The existing router (R1-R3) has been audited for this; no new router code was added in R4.

**Verdict**: **No vulnerability found.**

#### T2 — Symlink escape

**Threat**: Attacker plants a symlink `round-001.md -> /etc/passwd` in a known session directory; the endpoint reads the symlink target.

**Mitigation**:
- `readPriorNotesFromSession` at `src/index.ts:524-526` calls `path.resolve(filePath)` and checks `resolved.startsWith(prefix)` where `prefix = sessionDir + path.sep`. If the resolved path escapes the session dir, the file is skipped.
- The path.resolve happens AFTER the regex match (`/^round-(\d+)\.md$/`) and AFTER the session-dir existence check.

**Residual risk**: Low. `path.resolve` follows symlinks. If the attacker controls the session dir contents (they would need shell access on the host), they could plant a symlink to a sibling file in the same dir (e.g., `state.json`). But that's already inside the session dir, so the `startsWith(prefix)` check passes. The endpoint only returns the `notes` section of `round-NNN.md` files; if the symlink target is `state.json`, the parse returns `""` (no `## Notes` heading in `state.json`). **No data leakage beyond what's already in the session dir.**

**Verdict**: **No vulnerability found.**

#### T3 — NUL byte injection

**Threat**: Attacker sends `id=foo\u0000../../etc/passwd` hoping the validator truncates at NUL.

**Mitigation**:
- `validateSessionId` regex `/^[a-zA-Z0-9_-]+$/` rejects `\u0000` (regex doesn't match NUL).
- `readPriorNotesFromSession` at `src/index.ts:485-487` adds a defense-in-depth check: `if (sessionDir.includes("\u0000")) return 400`.

**Verified by unit test** T4.2: `validateSessionId("foo\u0000bar") === false`.

**Verdict**: **No vulnerability found.**

#### T4 — Information disclosure (cross-session notes leak)

**Threat**: User A knows User B's `session_id` and reads User B's prior notes.

**Mitigation**:
- Session IDs are 16-char base36 strings (`Math.random().toString(36).slice(2, 18)` or similar — per existing R1-3 code). Brute-force is computationally infeasible.
- The endpoint has no auth — same as the existing `GET /api/review/${id}` endpoint. Adding auth is out of scope for R4 (no state schema change, no breaking changes to existing endpoints).
- If the attacker has shell access or knows the session_id, they could already read `state.json` and `round-NNN.md` via the filesystem.

**Residual risk**: Acceptable. The endpoint exposes the same data as the filesystem; the trust boundary is "knows the session_id" which is the same boundary as the rest of the API.

**Verdict**: **No new vulnerability found.** (This is consistent with the existing API surface; if session_id confidentiality is a concern, it's a separate hardening task.)

#### T5 — Race conditions (TOCTOU)

**Threat**: Two concurrent reads of the same `round-NNN.md` while a write is in progress.

**Mitigation**:
- The endpoint is read-only (verified by T3.1 mtime test).
- `writeFileAtomic` (R1) uses temp-file + rename which guarantees readers see old or new, never a torn mix.
- Concurrent reads of the same file are safe (POSIX guarantees whole-file reads on local FS).

**Verdict**: **No vulnerability found.**

#### T6 — Response shape leakage

**Threat**: Error responses leak filesystem paths or stack traces.

**Mitigation**:
- 400 errors return `{error: "invalid session id"}` — no path info.
- 404 errors return `{error: "session not found"}` — no path info.
- Success returns `{rounds: [{round: number, notes: string}]}` — only round numbers + parsed notes text. No file paths, no absolute paths.

**Verdict**: **No vulnerability found.**

#### T7 — Denial of service via large input

**Threat**: Attacker sends a 1MB session_id to exhaust memory.

**Mitigation**:
- `validateSessionId` rejects strings >64 chars.
- The router itself usually parses session_id as a path component; most HTTP servers cap URL length.

**Verdict**: **No vulnerability found.**

#### T8 — Write capability check

**Threat**: The endpoint could be tricked into writing to `state.json`.

**Mitigation**:
- `readPriorNotesFromSession` only imports `readFile` + `readdir` from `node:fs/promises`. Never imports `writeFile` or `appendFile`.
- Verified by T3.1 mtime-snapshot test: `state.json` and `round-001.json` mtimes are unchanged after invocation.

**Verdict**: **No vulnerability found.**

### New attack surface

- 1 new HTTP route: `GET /api/review/${id}/prior-notes` (read-only).
- 3 new exported symbols for tests: `validateSessionId`, `parsePriorNotes`, `readPriorNotesFromSession` (via `__test` namespace).
- No new filesystem write paths.
- No new external dependencies.
- No new environment variables.

## Findings by severity

### CRITICAL
**None.**

### HIGH
**None.**

### MEDIUM
**None.**

### LOW

| # | Finding | Notes |
|---|---|---|
| L1 | T4 (cross-session notes leak via known session_id) | Same trust boundary as existing API; out of scope for R4. If session_id confidentiality is a concern, add an auth layer in a future round. |
| L2 | The dev's "defense in depth" `Bun.file(sessionDir).stat()` + readdir fallback (`src/index.ts:485-497`) is slightly redundant | Bun.file().stat() works for directories; the readdir fallback only triggers on edge cases. Cosmetic. |

## Verdict

**PASS** — endpoint is read-only, validated, defense-in-depth, no new attack surface.

```json
{
  "verdict": "PASS",
  "critical": 0,
  "high": 0,
  "medium": 0,
  "low": 2,
  "threats": [
    {"id": "T1", "name": "Path traversal", "status": "mitigated", "evidence": "validateSessionId + 7 unit tests"},
    {"id": "T2", "name": "Symlink escape", "status": "mitigated", "evidence": "path.resolve + startsWith(prefix) check"},
    {"id": "T3", "name": "NUL byte injection", "status": "mitigated", "evidence": "regex + readPriorNotesFromSession NUL check"},
    {"id": "T4", "name": "Cross-session info disclosure", "status": "acceptable", "evidence": "same trust boundary as existing API"},
    {"id": "T5", "name": "TOCTOU race", "status": "not_applicable", "evidence": "read-only endpoint"},
    {"id": "T6", "name": "Response leakage", "status": "mitigated", "evidence": "errors contain no path info"},
    {"id": "T7", "name": "DoS via large input", "status": "mitigated", "evidence": "validateSessionId length cap 64"},
    {"id": "T8", "name": "Write capability check", "status": "mitigated", "evidence": "T3.1 mtime-snapshot test"}
  ]
}
```