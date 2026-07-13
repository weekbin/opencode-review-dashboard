# R160 Brief — [USER ISSUE #2] README 图片统一 + 文档更新

## Scope

1. **图片统一到 1280×720 (横屏, 16:9)**:
   - 缩放 R16 那 3 张 (2416×1439 → 1280×720)
   - 重截 R17 那 3 张 (1297×2559 → 1280×720)— 旧图被错误拉伸,必须重截
   - 缩放老 4 张 (1800×2880 → 1280×720) — `commits/conversation/diff/finding.png`
   - 缩放 atomic-state-writes-test (1100×720 → 1280×720)
   - 缩放 uncommitted-files (2880×1800 → 1280×720)
   - 缩放 R132 evidence 2 张 (900×1280 → 1280×720)
   - 复用 R132 evidence 到 docs/screenshots/(resize 后的 720×1280)

2. **新截图 (5 张,1280×720)**:
   - `r132-lock-banner-light.png` — R132 lock banner 在 light mode
   - `r137-copy-round-notes.png` — R137 copy round notes 按钮 + 反馈 toast
   - R17 三张重截:`r17-help-overlay.png` / `r17-ime-composition.png` / `r17-notes-in-submit-modal.png`

3. **README 更新 (EN + ZH)**:
   - 加 "Lock status banner" 段 (R132)
   - 加 "Copy round notes from history" 段 (R137)
   - 更新 "Switch languages" 段 (提及 R133 bilingual tooltips/aria-labels)
   - R60 测试 PASS (双语结构对称)

## Files affected

- `README.md` + `README.zh-CN.md` (3 段新增 + 1 段更新)
- `docs/screenshots/*` (5 新增 + 5 修改 + 7 删除)
- 5 张新截图 (1280×720)

## Risk

- **No behavior change** to runtime code. Pure docs + screenshot refresh.
- **R60 bilingual parity** must hold.
- **Mock server** was temporarily modified to inject `locked: { at, round, by }` and `prior-notes` round 1 for screenshots — restored to HEAD before commit.

## Profile

Housekeeping (0 features / 0 bugfixes / 0 polish). Image/visual consistency round. User-driven.