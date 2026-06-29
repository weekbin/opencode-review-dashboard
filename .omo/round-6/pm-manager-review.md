# Round 6 PM Manager Review

> **Date**: 2026-06-29
> **Reviewer**: Round 6 PM Manager
> **Verdict**: APPROVE
> **Pre-check result**: PASS (reused from PM Triage brief.md ## Source — Patch G optimization)

## Pre-check (code-commit verification)

PM Triage brief.md line 16 reports: **"ALL 12 R5 SHAs verified OK via `git cat-file -e` — `a3f04aa` ✓, `7ecea28` ✓, `bfbcaa2` ✓, `75cb49d` ✓, `a257e4e` ✓, `0652dee` ✓, `ee06bd5` ✓, `a598015` ✓, `c21f4a0` ✓, `66027f8` ✓, `e3a6d9e` ✓, `f76caa7` ✓. R5 audit-trail is grounded."** Per Patch G optimization (R5 retro), I cite this and do **not** re-run `git cat-file -e` myself. Pre-check = PASS, reused.

I additionally spot-verified the R5 source-of-truth docs that PM Triage cited: `retro.md` lines 31–36 (Followup items R5 MINOR #1–#3), `test-report.md` lines 35 / 75–77 (Risk register H1/M1/M2), and `review-code.md` lines 15–47 (H1/M1/M2/M3 findings). All exist and match brief.md ## Source citations.

## Sub-candidate evaluation

### #1 — Widen CJK regex to full CJK coverage (R5 MINOR #1)

- **Real user pain**: The agent prompt at `src/index.ts:1433` advertises "中文, 日本語, 한국어" as detectable, but the regex at `src/index.ts:630` (`const CJK_RE = /[\u4e00-\u9fff]/g;`) only covers CJK Unified Ideographs (Hanzi / Kanji / Hanja). Pure-Hiragana, pure-Katakana, and pure-Hangul input all yield ratio = 0 → `"en"`, contradicting the docs. R5 `review-code.md:15–28` flagged this as H1 (HIGH, ship-as-is) — it is a **doc-vs-implementation contract mismatch**, not a hypothetical need. The user need is "the prompt must not lie about what the regex covers."
- **Pseudo-requirement markers**: None.
  - DUPLICATE — no existing widened regex; the change is the only such regex in the codebase (verified `src/index.ts:630` is the sole `CJK_RE` definition).
  - SPECULATION — partially mitigated: the R5 retro (`retro.md:33`) notes "Defer until user expresses need (current user is Chinese-speaking; Korean/Japanese out of scope)." However, R5 retro MINOR #1 was **accepted as a followup at retro close**, the user picked the R6 polish bundle at the R6 user-pick gate, and the brief's risk register (`brief.md:89`) is honest about the affected user population being zero. The remaining motivation is **contract accuracy** (the prompt already claims "日本語, 한국어" detection), not pure user demand. Acceptable.
  - CONTRADICTION, INFLATED, OBSCURE — none.
- **Verdict**: **APPROVE**. Fixes a documented H1 finding from R5 review-code.md. 1-line regex change + 3 test cases (`src/language-detect.test.ts`).

### #2 — Extract threshold constants + remove unnecessary `?.` (R5 MINOR #2)

- **Real user pain**: Maintainer-facing. The threshold pair `0.3` / `0.1` is duplicated across 4 files (`src/index.ts:637-638`, `src/index.ts:1433`, `README.md:109-110`, `README.zh-CN.md:109-110`); drift hazard on any future tweak. `text?.trim() ?? ""` at `src/index.ts:633` is dead defensive code — `text: string` is non-nullable per the signature at `src/index.ts:632`. R5 `review-code.md:33-45` flagged both as M1 + M2 (MEDIUM, deferred to R6).
- **Pseudo-requirement markers**: None.
  - DUPLICATE — no existing constants module; this *creates* the single source of truth.
  - SPECULATION — not speculation; it's a real maintainer ergonomics + hygiene fix explicitly deferred from R5.
  - Other markers — none.
- **Verdict**: **APPROVE**. Pure refactor; existing 15 tests in `src/language-detect.test.ts` (4 describes × 15 `it` blocks, counted via grep) should pass unchanged since threshold values stay identical.

### #3 — Agent prompt + README cleanup (R5 MINOR #3)

- **Real user pain**: After #1 lands, the agent prompt's "中文, 日本語, 한국어" example becomes accurate (Hangul/Hiragana/Katakana are now in the regex). The two READMEs at `README.md:114` and `README.zh-CN.md:114` currently advertise only the Hanzi range `[\u4e00-\u9fff]` and must be widened to match the post-#1 regex. Without #3, the docs lie again (different lie than before, but still a lie). R5 `retro.md:35` lists this as MINOR #3: "Cleanup agent prompt's '한국어' example — either remove the Korean word or add a caveat that the regex is Chinese-specific. The example overpromises."
- **Pseudo-requirement markers**: None.
  - DUPLICATE — not a duplicate; this is the canonical post-#1 doc sync.
  - SPECULATION — doc accuracy is universally desirable, not speculative.
  - INFLATED — scope is tightly bounded: agent prompt line 1433 example + 2 README lines (114 in each). PM Triage's #3 correctly chose **#1's post-state** (regex widened) over the narrower R5 retro MINOR #3 wording ("remove the Korean word or add a caveat"). The broader scope is the **only** honest option once #1 lands — narrowing the README back to "Chinese only" would contradict the widened regex. Not inflation, natural consequence.
  - CONTRADICTION, OBSCURE — none.
- **Verdict**: **APPROVE**. ~10 LOC of text-only edits across 3 files; no runtime risk.

## Bundle coherence

**Natural, not forced.** All 3 sub-candidates share the same code surface — `src/index.ts:628-640` (the `detectLanguage` helper) is the single point of truth that the agent prompt (line 1428-1435) and both READMEs (lines 105-114) document. Synergies:

- **#1 ↔ #3**: Mandatory ordering. Once #1 widens the regex, #3 must update the agent prompt + 2 READMEs to match. Without #3, the docs regress to a different contradiction (Hanzi-only doc, full-CJK regex). With #3, the docs accurately describe the post-#1 implementation.
- **#2 (independent)**: Constants extraction + dead `?.` removal touch the same function body but don't depend on #1 or #3. Can land in any order. Bundled because all 3 were deferred together from R5 retro (`retro.md:31-36`) as a single "polish round".
- **Files touched (unique)**: 3 — `src/index.ts`, `README.md`, `README.zh-CN.md`. Confirmed by mapping each sub-candidate's `Files` field.

Bundle is **tightly scoped** (~25-30 LOC, 3 files, 1 code path), low risk, high signal. Splitting into 3 rounds would be wasteful — natural round boundary.

## Architecture profile validation

PM Triage's `user_impact_profile` (brief.md lines 97-108) is reproduced verbatim and re-scored below:

| Field | Value | Score |
|---|---|---|
| U_size | small (1-2 user-visible files) | 0 |
| U_files | small (2-3: src/index.ts + 2 READMEs) | 1 |
| U_new_capability | no | 0 |
| U_behavior_shift | no | 0 |
| U_user_visible | yes | 2 |
| U_data_shape_breaking | no | 0 |
| U_data_safety | no | 0 |
| U_installs_new_dep | no | 0 |
| **Total** | | **3** |

**Rule application** (per brief.md:113-115):

- **Rule 1 (architecture)**: U_size(0) + U_files(1) + U_user_visible(2) = 3 < 8 → **SKIP**.
- **Rule 2 (feature)**: U_user_visible=yes AND total >= 3 (3 ≥ 3) → **MATCH**.
- **Rule 3 (bugfix)**: default, requires a bug report — no bug filed in R5 retro for these polish items (they were M1/M2/H1/Ship-as-is followups, not bug reports) → **NOT MATCHED**.

→ **Profile = feature**. PM Triage's classification is correct.

**Note for Lead** (mirroring brief.md:117): Profile = feature mandates 5-lens review. For a polish round this small, Lead may consider whether 5-lens is overkill — but the rule set is clear and 5-lens coverage is appropriate given #1 changes user-visible behavior (Korean/Japanese users get Chinese-style replies instead of English).

## Overall verdict

**APPROVE**

The R5 polish bundle is a coherent, low-risk, well-cited set of 3 followups that fix a documented HIGH-severity contract mismatch (#1), eliminate MEDIUM-severity code-quality debt (#2), and sync docs to the post-#1 implementation truth (#3). All file:line citations from PM Triage's brief were independently verified against current `src/index.ts`, `README.md`, `README.zh-CN.md`, `src/language-detect.test.ts`, and the R5 source docs (`retro.md`, `test-report.md`, `review-code.md`). No pseudo-requirement markers triggered. Pre-check reused from PM Triage per Patch G optimization (12/12 R5 SHAs verified). Profile = feature per Rule 2.

## Action items

None — bundle is ready for Lead handoff. Recommended implementation ordering: **#1 → #2 → #3** (per brief.md:92). Lead owns sequencing; PM Manager's review is complete.

---

## PM Manager Self-Review Notes (for retro)

- Patch G optimization **honored**: cited PM Triage's pre-check result instead of re-running `git cat-file -e`. No regression.
- Total review time: 4 file reads (brief.md + 4 source citations in parallel + 3 R5 docs) + 3 grep calls. No subagents spawned; this is a PM Manager review, not an investigation.
- One SPECULATION-adjacent note surfaced for #1: R5 retro marked MINOR #1 as "Defer until user expresses need", and the user population is currently zero per PM Triage's own risk register. This is borderline but acceptable because (a) the contract mismatch is real and documented at R5 review-code.md H1, (b) the user picked the R6 polish bundle, and (c) PM Triage was transparent about the zero-user-population framing. Recorded for transparency, not as a blocker.