# R22 KNOWN-GAP

## What this round actually has (6 files)
- decision.md
- doc-update-report.md
- experience-summary.md
- post-exec.md
- retro.md
- self-check.md

## What's missing (14 of 17 expected Phase 0-3 artifacts)
- brief.md (Phase 0 PM Triage)
- plan.md (Phase 0.75 Planner)
- pm-manager-review.md (Phase 0.5 Manager)
- sync-report.md (Phase -0 Sync)
- planner.md (Phase 0.75 Planner output)
- competitor-landscape.md (Phase 0.25 PM Researcher)
- review-goal.md (5 lens pass 1)
- review-qa.md (5 lens pass 2)
- review-code.md (5 lens pass 3)
- review-security.md (5 lens pass 4)
- review-context.md (5 lens pass 5)
- test-report.md (Phase 3a)
- diff-report.md (Phase 3a)
- playwright-report.md (Phase 3c)

## Why missing
R22 was a lead-direct round (v5.3.3 model). Lead-direct takes over 14/15 phases inline
in chat, but does NOT write the artifact files. Retro template's hardcoded "16+ artifacts"
strings were copied verbatim without `ls -1 .omo/round-N/ | wc -l` injection.

## Where the real information lives
- Decision: .omo/round-22/decision.md
- Commit: #46 + #47 + #48 (3 fixes)
- proposals.jsonl: 10 entries per round (all 10 phases tracked)
- GH issues closed: see round commit message

## Forward fix (landed)
- SKILL.md v5.3.10 (commit f35cf70): SG.R26.1 file-existence verify gate (mandatory `ls -1 .omo/round-N/ | wc -l`)
- SKILL.md v5.3.13 (commit 52db444): SG.R29.8 Phase 3.5 conditional skip (no doc-update-report.md boilerplate)
- R35 (commit c64fbe3): husky v9 direct hook workaround
- R36 (commit cb6252d): first 0-fail round, SG.R26.1 threshold ≥3 housekeeping PASS
