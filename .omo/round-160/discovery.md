# R160 Discovery — [USER ISSUE #2] README 图片统一 + 文档更新

## User directive (verbatim)

> README 的文档要根据现有功能更新下了，而且有些图片，是竖屏图，有些是横屏图，不统一，建议用统一大小的页面截图，放到 README 当中。如果存在截图确缺失的情况，也要补一下。

## Surfaced scope

### Image inventory (current)

```
$ find docs/screenshots -type f \( -name '*.png' -o -name '*.jpg' \) | wc -l
54

$ sips -g pixelHeight -g pixelWidth per file | uniq
720 1280 (48 files, 16:9 landscape) — R12+ standard
1297×2559 (3 files, R17) — MALFORMED STRETCH (9:19.7 aspect ratio)
2416×1439 (3 files, R16) — 1440p retina
1800×2880 (4 files, legacy)
1100×720 + 2880×1800 (incidental)
```

### Standard: 1280×720 (横屏 16:9) — what 13 R12+ standard images already use

### Image operations required (13 ops)

1. **resize R16 (3)**: 2416×1439 → 1280×720 via `sips -z 720 1280`
2. **resize old (4)**: 1800×2880 → 1280×720
3. **resize atomic-state-writes-test (1)**: 1100×720 → 1280×720
4. **resize uncommitted-files (1)**: 2880×1800 → 1280×720
5. **resize R132 evidence (2)**: 900×1280 → 1280×720 + copy to docs/screenshots/
6. **re-capture R17 (3)**: 1297×2559 — content is malformed, must re-screenshot
7. **capture new (5)**: R132 lock banner light, R137 copy round notes (+ 3 R17 re-captures = 8 total new)

### README updates required

Audit of R132-R158 user-perceivable features:

| Round | Feature | README? |
|-------|---------|--------|
| R132 | Lock status banner | **MISSING** — add |
| R133 | Bilingual tooltips + aria-labels on 6 toolbar buttons | partial — extend Switch languages |
| R137 | Copy round notes button | **MISSING** — add |
| All others | housekeeping/refactor | n/a |

### Mock-server modifications

For screenshots, mock-server.py needs:
- `locked: { at, round, by }` in main payload (for R132 lock banner)
- Round 1 in `/api/review/<id>/prior-notes` response (for R137 copy round notes — current filter is `round < currentRound`)
- `bun run build` to refresh `dist/ui/app.js` after mock + src changes

Restored to HEAD before commit.

## Acceptance

- [ ] All 13 image operations complete
- [ ] All 5 new screenshots at 1280×720 (横屏 16:9)
- [ ] README.md + README.zh-CN.md both have 3 new/updated sections
- [ ] R60 bilingual parity test PASS (EN sections == ZH sections)
- [ ] pre-commit 8/8 PASS (check #1-9, including the new "no remote CI" check from R159)
- [ ] bun test 1119/1119 PASS

## Profile

Housekeeping (0 features / 0 bugfixes / 0 polish). Visual consistency + docs round. User-driven (ISSUE #2).