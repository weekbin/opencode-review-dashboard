# R80 Verify

## Pre-commit
8/8 PASS. 1929 expect() calls across 727 tests in 63 files (4s).

## Tests
- 727/727 pass (722 R79 baseline + 5 R80 new)
- src/ui/r80-arc-validation.test.ts: 5 tests
  - SKILL.md integrity
  - pre-commit 8-check hook
  - i18n STRINGS table ≥100 keys
  - ≥24 .omo/round-N/ artifact dirs
  - proposals.jsonl ≥27 v6-format entries