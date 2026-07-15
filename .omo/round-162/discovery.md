# R162 Discovery

## Backlog (8 issues, AT hard cap 5 bug + 3 feature + 0 polish = 8 total)

- **#85** Force Reopen button on stale findings does nothing when clicked (bug)
- **#86** AI-resolved findings don't appear in Resolved filter and can't be un-resolved (bug)
- **#87** Drawer 中的 finding resolve 按钮点击无反应 (bug)
- **#88** AI 评论应感知用户当前语言；submit 接口需新增 locale 参数 (enhancement)
- **#89** range-banner 在没有内容时仍然渲染出空黄色框 (bug)
- **#90** 树状/平铺切换按钮高度过高，与行高不匹配 (enhancement)
- **#91** 设置按钮 + 设置弹窗整体 UX 重做（icon 化 / 整合 / 保存流）(enhancement)
- **#92** Round 计数在跨分支 diff 时错乱，建议改用 diff base 区分轮次 (bug)

## Carry-over
None this round (R161 ship_chain clean).

## Selection rationale
8 issues filed this session (#85-#92) cover distinct surface areas but all hit UI/UX/stability:
- Cluster A (action button handlers): #85, #87 — likely shared root cause (parent listener capture)
- Cluster B (filter/state shape): #86
- Cluster C (i18n + AI prompt): #88
- Cluster D (CSS-only): #89, #90
- Cluster E (Settings overhaul): #91
- Cluster F (state schema): #92

At cap. Will proceed with all 8 ACs.

## Anti-cap check
- Features: 3 (#88, #90, #91) ≤3 ✓
- Bugfixes: 5 (#85, #86, #87, #89, #92) ≤5 ✓
- Polish: 0 ≤1 ✓
- Total: 8 ≤8 ✓