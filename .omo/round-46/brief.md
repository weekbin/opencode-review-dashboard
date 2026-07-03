# R46 Brief

**Scope**: Rewrite `.opencode/skills/team-dev-loop/SKILL.md` from v5 (2716 lines, 70+ SG.R patches, 17 phases, 12 artifacts) to v6 (≤400 lines target → 230 lines actual, 7 capabilities, 6 artifacts). Extend `.husky/pre-commit` from 16 lines (lint+test only) to absorb v5 SG.R44.1 8-command mechanical sweep as checks 1-6, keeping lint+test as checks 7-8.

**Why**: v5's patch-on-patch pattern caused non-convergent complexity (R43 → R44 → R45 each surfaced prior round's latent gaps; SKILL.md grew from ~50 patches in v3 to 70+ in v5.3.14.1). User explicitly stated "loop's goal is fully automated iteration, user doesn't intervene" — v5's user-pick ceremony contradicts this. v6 collapses ceremony while preserving capabilities.

**Risk**:
- v5 retros will lose their patch-number references (`SG.R44.1` etc.) — mitigated by inline `[R5X lesson]` callouts preserving critical lessons
- Pre-commit #2 (SKILL.md drift) might fire false positives when SKILL.md is updated alongside other skill docs — mitigated by marking it informational-only
- Pre-commit #6 (plugin-load) requires `node` runtime + `scripts/verify-plugin-load.mjs` — already required by R44

**Acceptance**:
- SKILL.md line count < 300 (was 2716) ✓ achieved 230
- Pre-commit hook has 8 checks (was 2) ✓ achieved 8
- All 8 pre-commit checks PASS on current tree ✓ verified
- 626/626 tests pass ✓ verified
- No `SG.R##` patch numbers in v6 ✓ achieved