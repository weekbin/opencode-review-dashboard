# R160 Research — [USER ISSUE #2] README 图片统一 + 文档更新

User-driven round. Research scope:

1. Image inventory:
   - `find docs/screenshots -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' \) | wc -l` → 54
   - `sips -g pixelHeight -g pixelWidth` over all → 3 distinct sizes:
     - **720×1280 (48 files, 16:9 landscape)** — R12+ standard
     - **1297×2559 (3 files, R17, malformed stretch)** — MUST re-capture
     - **2416×1439 (3 files, R16, 1440p)** — needs resize
     - **1800×2880 (4 files, legacy)** — needs resize or delete
     - **1100×720 + 2880×1800 (incidental)** — needs resize

2. README audit (R132-R158 user-perceivable features):
   - **R132** Lock status banner — MISSING from README
   - **R133** Bilingual tooltips + aria-labels on 6 toolbar buttons — partial (only Switch languages mentioned)
   - **R134** Bilingual relative timestamps — covered by R132 retro doc, no README mention
   - **R137** Copy round notes button — MISSING from README
   - **R148** 1-year boundary in formatRelativeTime — internal, no README impact
   - **R150** 2 hardcoded English strings localized — internal
   - All other R132-R158 rounds are housekeeping/refactor (no user-perceivable change)

3. R60 bilingual parity test:
   - Compares EN/ZH `### ` section count
   - Currently EN: 33 → 35 (+2 new sections: Lock banner + Copy round notes)
   - ZH: 33 → 35 (same +2)
   - PASS expected.

Lightweight compression (per v6 SKILL, ≤3 files + small docs scope): research lives in `discovery.md` ## Surfaced candidates section.