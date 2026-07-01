# R27 Review — Functional Integrity

> **Generated**: 2026-06-30 (RALPH LOOP iteration 8, R27)
> **Lens**: L4 — Functional integrity (does the code do what it claims?)
> **Round**: 27 · **Merge SHA**: `37f8e00`

## Functional claims verification

### Issue #55 — tsc PATH investigation

**Claim**: `scripts/typecheck.sh` documents the correct typecheck usage (`bun run typecheck` instead of bare `tsc`).

**Verification**:
- TypeScript already installed (`^5.8.3` in devDependencies, `5.9.3` in node_modules)
- `typecheck: "tsc --noEmit"` already exists in package.json scripts
- Subagents were running bare `tsc` which is not in PATH
- Fix: wrapper script documents `bun run typecheck` as the correct invocation
- `bun run typecheck` → `tsc --noEmit` → exit 0

**Tests**: AC 14.1-14.5 **all PASS** (5 ACs verified).

**Functional verdict**: ✓ As advertised.

### Issue #56 — Apply SG.R25.1 skill-patch

**Claim**: Add new section to SKILL.md for "SG.R25.1: pre-commit SG.R22.1 verify gate". Update phase-prompts.md Phase 3.5 prompt.

**Verification**:
- SKILL.md has new section at line 1872 with full SG.R25.1 rule + F.1 evidence from R25
- SKILL.md header bumped v5.3.8 → v5.3.9
- patch count updated to 52 retroactive
- phase-prompts.md Phase 3.5 prompt updated with pre-commit verify step
- Existing SGs preserved (no breaking changes)

**Tests**: AC 15.1-15.6 **all PASS** (6 ACs verified).

**Functional verdict**: ✓ As advertised.

### Cross-feature integration

**Claim**: R27 changes don't regress R19.x, R20.1, R22.x, R24.1.

**Verification**:
- All existing SGs preserved (16× R19.x + 7× R20.1 + 13× R22.x + 6× R24.1)
- No source code changes (#55 tooling only)
- No breaking changes to dev workflow

**Functional verdict**: ✓ As advertised.

## Regression check

| Test | Before R27 | After R27 | Delta |
|---|---|---|---|
| Full suite | 602 pass / 0 fail | **602 pass / 0 fail** | 0 (no source code changes) |
| i18n regression guard | 33/33 | 33/33 | 0 (no new keys) |
| Typecheck (`bun run typecheck`) | skipped (tsc not in PATH) | **PASS** (exit 0) | FIXED |
| Existing SGs in SKILL.md | R19.x + R20.1 + R22.x + R24.1 | All preserved | 0 (no breakage) |

**No regressions introduced. NET POSITIVE: fixed tsc PATH issue (5 rounds stale)**.

## Verdict

**PASS** — all functional claims verified. No regressions. R27 fixes a 5-round-stale dev tooling issue AND embeds SG.R25.1 to prevent future bilingual lockstep gaps.