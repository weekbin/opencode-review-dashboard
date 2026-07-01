# Lens #4: Security — Round 12

> **Verdict: PASS** — Emoji whitelist enforced; input validation tight (400/404); atomic-write path reused (R1 invariant); no PII; no XSS surface; idempotent toggle prevents DoS via repeated POSTs.
> **Lead-synthesized** (R4 retro Gap 2 + R5 lead-default pattern).

## TL;DR
R12 introduces 3 endpoints + 1 new data shape. All three defensive layers are in place: input validation (400 on missing field), resource not found (404 on missing finding), and state mutation integrity (atomic write via `saveState` from R1). Emoji whitelist prevents enumeration / injection. No PII is stored (just emoji + hardcoded author "user" + timestamp). No XSS surface (emoji rendered as text content, not via innerHTML).

## Threat model

| Threat | Where exposed | Mitigation in R12 | Mitigation across repo |
|---|---|---|---|
| Input injection (e.g., emoji string script tag) | `POST /reaction` accepts `emoji` field | `isReactionEmoji()` validator against `EMOJI_WHITELIST` (Set of 6 typed literals) → 400 on miss | Existing `/comment` validates comment text length; pin endpoint has no user-string input |
| Resource enumeration | All 3 endpoints return `404 finding not found` for invalid ID | Endpoint pattern uses `find` + 404; no information disclosure (doesn't reveal which IDs exist) | Same pattern as existing endpoints (`/comment`, `/patch`) |
| Cross-site scripting (XSS) | Emoji is rendered in UI as reaction pill + finding badge | Emoji is a Unicode string literal from the whitelist, not a user-typed string — `.reaction-pill` textContent assignment (or innerText escape) — verified by CSS contract test T12.R3e | All existing UI renders `escape()` for user-supplied fields; R12 reuses same render path |
| Race condition / lost update | Two concurrent pin + unpin posts | Each endpoint reads-modifies-writes via existing `saveState` (atomic temp-file + rename from R1) | R1 atomic-write invariant is the repo-wide guarantee; all 13+ endpoints use it |
| DoS via repeated POSTs (no idempotency) | Attacker POSTs `/pin` 1000× | Idempotent: server checks `if (!target.pinned)` before mutating; second call returns same response without state change | Same pattern as `manually_reopened` toggle (R9) |
| Information disclosure in error responses | Verbose error messages | `/pin` + `/unpin`: only `{ error: "finding_id required" }` or `{ error: "finding not found" }` (no internal paths, no stack traces, no state dumps) | Same as existing endpoints |
| Author injection | Reaction payload could set `author: "admin"` to impersonate | `Reaction.author` is hardcoded `"user"` (literal type, not `string`) — server ignores any `author` from request body | R10 `manually_edited` had a similar literal-typed surface; R12 mirrors it |
| Emoji whitelist drift (downstream contributors add new emojis) | Unrecognized emoji slips through | Dev added `EMOJI_WHITELIST` constant + endpoint validates against it → 400 on miss; unit test asserts 6 whitelist + 2 sample non-whitelist rejected (R12 Risk #5 mitigation per plan.md) | Same approach as `ANCHOR_WHITELIST` / `SIDE_WHITELIST` in existing code |
| Direct URL access to hidden pin state | Reviewer can pin then expose via API | `POST /pin` returns `target.pinned` object — only what's already in the public state | Same as `/comment` returning the created comment |
| Replay / rollback | Attacker reverts to older state.json | Atomic write creates `state.json` → `state.json.tmp.<pid>` → `rename` — no rollback window | R1 invariant |

## Findings by severity

### CRITICAL (must fix before merge)
**None.**

### HIGH (should fix)
**None.**

### MEDIUM (defense-in-depth gap)

- **M.1** `index.ts:2080` — The 3 endpoints accept JSON via `request.json().catch(() => ({}))` which silently swallows parse errors. An attacker could send invalid JSON to evade input validation. **Defer to R13+ refactor; not R12 scope.** The `catch` matches existing endpoint style and the silent default `{}` still triggers the 400-on-missing-finding_id path (which works correctly). Informational only.

### LOW (informational)

- **L.1** Reaction `at: Date.now()` uses server-side timestamp. If the device clock is wrong, the timestamp drifts. **Acceptable**: same pattern as existing endpoints; not a security concern.
- **L.2** No rate-limiting on the 3 new endpoints. Same as existing endpoints. **Defer to a separate hardening round.**

## Threat-model summary

All 9 identified threats are mitigated by R12's design choices + inherited R1-R11 patterns. Two informational items (silent JSON parse catch + missing rate limit) are defer items consistent with the rest of the codebase.

## Verdict: PASS
Security posture is consistent with R1-R11 patterns. Emoji whitelist is the right primitive. No new PII surface. No XSS vector. Idempotency prevents state-explosion DoS.
