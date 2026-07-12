# R142 Brief — close R141 retro #2 (byte-equivalence test audit + SOP)

## Scope

1. **Audit-only round**: scan `src/*.test.ts` for byte-equivalence assertions on English strings. Already done in discovery. 4 candidate sites identified.
2. **Classify each site**: legitimate "i18n-coupling test" (current contract) vs. pathological "implementation detail" (genuinely brittle). Done in discovery.
3. **Document SOP** for future audits in this round's `verify.md` + `retro.md`. No code changes needed.
4. **Close** the R141 retro #2 stale flag (audit closes; SOP doc prevents re-surfacing).
5. Append R142 entry to `.omo/proposals.jsonl` (per-SHIP discipline).

## Findings

| Test site | Asserted text | Verdict | Why |
|---|---|---|---|
| `edit-finding.test.ts:92` | `Edited by user` | i18n-coupling (legitimate) | Comment identifies the editor in user-facing text. Contract = "system comment says 'Edited by user'". Will update atomically with future i18n. |
| `previously-hint.test.ts:57` | `Conversation tab` | i18n-coupling (legitimate) | Hint text references the tab name. Contract = "the hint points to the conversation panel". Will update atomically with future i18n. |
| `reopen-stale.test.ts:84` | `Manually reopened:` | i18n-coupling (legitimate) | Prefix for manually-reopened audit comments. Contract = "manually-reopened comments have prefix `Manually reopened:`". Will update atomically with future i18n. |
| `saved-replies.test.ts:91` | `Save current as template` | i18n-coupling (legitimate) | Label for the "save current as template" button (`saveCurrent.textContent = "💾 Save current as template…"` at app.ts:5069). Future-i18n candidate (turn into t("savedReplies.saveCurrent")). |

## SOP: How to handle i18n-coupling tests in v6 polish rounds

Per the R137→R141 pattern (T11.2d, T16.8d/T16.10a, T10.1c — all in the same SHIP commit as their respective i18n changes), the v6 loop should:

1. **Localization changes → behavior-contract test upgrade in same commit.**
2. Brittle path tests (T10.1c was a path test) get upgraded to anchor on `t()` lookups instead of literal strings, e.g.:
   - Old: `expect(block).toMatch(/Edited by user/)`
   - New: `expect(block).toMatch(/t\("audit\.editedBy"\)\)/` OR `expect(block).toMatch(/author: "user"/)`
3. **Run `grep -rn '<english-string>' src/*.test.ts`** before any i18n PR to find the tests that need atomically updated.

## What this round ships

- **No code changes.** This is a documentation-only round.
- 6 v6 artifacts (`discovery.md` + `brief.md` + `research.md` + `verify.md` + `retro.md` + `decision.md`).
- 1 entry to `.omo/proposals.jsonl` (R142 entry).

## Hardening included

- Append R141 entry to `.omo/proposals.jsonl` (per-SHIP discipline per R134 retro lesson #4).

## Acceptance

- `bash .husky/pre-commit` PASS (pre-commit will only run on the round artifacts themselves, which are markdown; no test surface affected).
- All 6 artifacts present in `.omo/round-142/`.
- Working tree clean before commit (no uncommitted source/test changes).

## Profile

Housekeeping (audit-only). 0 features / 0 bugfixes / 0 polish.