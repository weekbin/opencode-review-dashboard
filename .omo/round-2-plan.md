# Round 2 Plan: Team Dev Loop v2 — 拆掉 `team_create`, 落盘全 tracked

> **Plan path:** `/Users/yangweibin/Projects/opencode-review-dashboard/.omo/round-2-plan.md`
> **Plan date:** 2026-06-28
> **Author:** sisyphus (primary chat)
> **Status:** DRAFT — awaiting user approval before code changes
> **Base:** Round 1 实际跑通 1 次 (commit `fcdf498`), 评估结论为"保留 team 设计的 5 review lens 并行 + 失败隔离，拆掉 `team_create` 生命周期、`.omo/` gitignored、brief-quality-report 等 meta-artifacts"

---

## 0. 为什么有这次重构

Round 1 跑出来 3 个事实 (红蓝对抗后的综合评估):

1. **真并行有价值** — 5 review-work lens 用 5 个 `unspecified-high` 后台并发跑, 产出 `review-goal.md` (91L) + `review-qa.md` (183L) + `review-code.md` (119L) + `review-security.md` (311L) + `review-context.md` (155L) 共 859 lines 异构审计内容, 用单 prompt + 5 sections 做不到 (单 context 30k tokens + per-lens retry 粒度丢失)
2. **`team_create` 是 dead weight** — 7 members = 7 chat sessions, ~7 `team_send_message` wakeups, ~12 `team_task_list` polls, 3 lead inline takeovers, 全部 rescue rate 43% (3/7 members needed lead takeover). 整套 team lifecycle 在 Round 1 里净亏损.
3. **`.omo/` gitignored = 假持久化** — 15 个文件 156,665 bytes, PR review 看不见, 跨机器看不见, 几天后本机都找不全

**用户决策 (2026-06-28):** 选方案 A: 拆 `team_create`, 7 roles 改用 `task(category=...)` 顺序 + 5 review lens 用 `run_in_background=true` 并发, 落盘 review-*.md 到 `.omo/round-N/` 但**全部 tracked** (项目级设计文档库, 不是 ephemeral audit).

---

## 1. 目标 (in scope)

1. **删除** `team_create` / `team_send_message` / `team_shutdown_request` / `team_approve_shutdown` / `team_delete` 全部调用
2. **保留** 7 roles, 改用 `task(category="...", subagent_type="...")` 顺序调用
3. **保留** 5 review lens 并行, 改用 5 个 `run_in_background=true` 同时跑
4. **删除** `.gitignore` 里的 `.omo/` (全 tracked)
5. **删除** `brief-quality-report.md` (PM self-critique), 合并进 `brief.md` 末尾
6. **删除** `dev-self-check.md` (144 lines, AC trace), 合并进 `decision.md` 末尾
7. **保留** `pm-manager-review.md` (52 lines, gate verdict) — 真有价值
8. **保留** 5 个 `review-*.md` (859 lines, 并行产物) — 设计核心
9. **保留** `plan.md` (445 lines, 决策完备) — 设计核心
10. **保留** `decision.md` (106 lines, merge record) — 设计核心
11. **更新** SKILL.md + phase-prompts.md + loop-decision.md + docs/team-dev-loop.md 反映新设计
12. **1 个 commit 推到 main** (不走 PR, 这是基础设施重构)

## 2. 不在 scope (out of scope)

- **不**改任何 `src/` 代码 — 这是设计/文档/skill 层面的重构
- **不**重写 e2e tests — Round 1 的 10 unit + 13 e2e 不动
- **不**改 Phase 0.5 (PM Manager) 的硬性 gate 语义 — 如果 PM Manager 返回 REJECT, lead 仍然必须停下来问用户
- **不**改 lead inline takeover 协议 — Round 1 里 lead 接管 3 个 deliverable (diff-report.md, playwright-report.md, doc-update-report.md), Round 2 仍然允许 lead 在 subagent 返回空/失败时直接写 deliverable, 但**作为设计 feature**写进 plan 而非"rescue"
- **不**做 Round 2 的实际 issue 处理 — 那是下一个 round 的事; 这次只是把 loop 自身的工具修好
- **不**碰 `.opencode/` runtime 目录 (reviews/, logs/, cache/) — 这些继续 gitignored (per-machine state)

## 3. 新的 round 文件结构 (项目级文档库, 全部 tracked)

```
.omo/
├── round-1/                          # Round 1 的完整审计 (回看用, 序号叠加不覆盖)
│   ├── brief.md
│   ├── plan.md
│   ├── pm-manager-review.md
│   ├── review-goal.md
│   ├── review-qa.md
│   ├── review-code.md
│   ├── review-security.md
│   ├── review-context.md
│   ├── test-report.md
│   ├── diff-report.md
│   ├── playwright-report.md
│   ├── doc-update-report.md
│   └── decision.md
├── round-2/                          # Round 2 的新位置
│   ├── brief.md
│   ├── plan.md
│   ├── pm-manager-review.md
│   ├── review-goal.md
│   ├── review-qa.md
│   ├── review-code.md
│   ├── review-security.md
│   ├── review-context.md
│   ├── test-report.md
│   ├── diff-report.md
│   ├── playwright-report.md
│   ├── doc-update-report.md
│   └── decision.md
└── proposals.jsonl                   # 跨 round 决策日志 (append-only)
```

**对比 Round 1 的差异**:
- **删除** `brief-quality-report.md` (18 lines, PM self-critique, 合并进 `brief.md` 末尾的 `## Self-Critique` section)
- **删除** `dev-self-check.md` (144 lines, AC trace, 合并进 `decision.md` 末尾的 `## Dev Self-Check (AC1-AC13 trace)` section)
- 其它文件结构不变

**13 files × 2 rounds = 26 files 进 git, ~150KB × 2 = ~300KB 总 tracked 体积**, 可接受.

## 4. 新执行流程 (lead 是 primary chat, 不再 `team_create`)

### 4.1 总览 (伪代码)

```typescript
// Round N 启动
const roundDir = `.omo/round-${N}`

// 1. PM (Phase 0) — 串行, 单 task
const pmResult = await task({
  category: "unspecified-high",
  prompt: PM_TRIAGE_PROMPT,   // from references/phase-prompts.md
})

// 2. PM Manager (Phase 0.5) — 串行, 单 task
const pmMgrResult = await task({
  category: "unspecified-high",
  prompt: PM_MANAGER_PROMPT,
})
if (pmMgrResult.verdict === "REJECT") {
  askUser("PM Manager REJECT: ${pmMgrResult.reason}. Override or skip?")
}

// 3. user pick candidate (gate, 硬性)
// 问用户从 PM 的 candidates 里选 1 个, 等回答

// 4. Architect (Phase 1) — 串行, 单 task
const architectResult = await task({
  category: "unspecified-high",
  prompt: ARCHITECT_PROMPT,
})
// 产出: .omo/round-N/plan.md

// 5. Dev (Phase 2) — 串行, 单 task, 内含 worktree 创建
const devResult = await task({
  category: "unspecified-high",
  prompt: DEV_PROMPT,           // 包含 inline self-check (AC trace 进 decision.md)
})

// 6. Tester 3 lanes — 串行 (tester-review 内部 5 lens 并行)
const reviewResult = await task({     // 6a. tester-review: 5 lens 并行
  category: "unspecified-high",
  prompt: TESTER_REVIEW_PROMPT,       // 内部 fire 5 个 run_in_background=true
})
const diffResult = await task({       // 6b. tester-diff
  category: "unspecified-high",
  prompt: TESTER_DIFF_PROMPT,
})
const playwrightResult = await task({ // 6c. tester-playwright
  category: "unspecified-high",
  prompt: TESTER_PLAYWRIGHT_PROMPT,
})
// 任何一个 FAIL → loop back to Dev (per loop-decision.md)

// 7. PM Doc Writer (Phase 3.5) — 串行
const docResult = await task({
  category: "unspecified-high",
  prompt: PM_DOC_WRITER_PROMPT,
})

// 8. Decision (Phase 4) — lead 自己做, 写 .omo/round-N/decision.md
writeDecisionFile(roundDir, { allVerdicts, devSelfCheckAC, ... })

// 9. Append proposals.jsonl
appendProposalLine(roundDir, decisionSummary)

// 10. Commit + push (走 PR 还是直推 main 由 lead 决定; Round 1 是用户批准后直推)
```

### 4.2 Lead 不用 `team_create`, 但仍保留 lead → role 通信

| 旧 (Round 1) | 新 (Round 2) |
|---|---|
| `team_create` → teamRunId | (none) |
| `team_task_create` per phase | (none, 顺序是隐式的) |
| `team_send_message` (×7) | `task()` (×7-8) |
| `team_task_list` poll (×12) | (none, `task()` 是同步的, 返回 = 完成) |
| `team_shutdown_request` (×7) | (none, subagent 用完即弃) |
| `team_approve_shutdown` (×7) | (none) |
| `team_delete` (×1) | (none) |

**净减少**: 7 wakeups + 12 polls + 7 shutdowns + 7 approves + 1 team_delete = **34 turns of orchestration overhead eliminated per round**

### 4.3 5 review lens 并行 (Round 1 验证有效的部分)

```typescript
// tester-review 内部
const [goal, qa, code, security, context] = await Promise.all([
  task({ category: "unspecified-high", run_in_background: true, prompt: LENS_GOAL_PROMPT }),
  task({ category: "unspecified-high", run_in_background: true, prompt: LENS_QA_PROMPT }),
  task({ category: "unspecified-high", run_in_background: true, prompt: LENS_CODE_PROMPT }),
  task({ category: "unspecified-high", run_in_background: true, prompt: LENS_SECURITY_PROMPT }),
  task({ category: "unspecified-high", run_in_background: true, prompt: LENS_CONTEXT_PROMPT }),
])
// 写 5 个文件到 .omo/round-N/review-*.md
```

每个 lens 写到独立文件, lead 读全部后合成 `test-report.md` (tester-review 的 deliverable).

### 4.4 Lead inline takeover 协议 (作为 design feature, 不是 rescue)

**触发条件** (任一):
- `task()` 返回空 (e.g. tester-diff 生成空 SVG)
- `task()` 返回 "BLOCKED" (e.g. tool-invocation dead-end)
- `task()` context-exhausted (e.g. tester-playwright 超长)
- `task()` 显式标 FAIL

**Lead 动作**:
- 写一个 `lead-takeover.md` 到 `.omo/round-N/lead-takeover-<role>.md` 说明接管原因 (5-10 lines)
- 自己写 deliverable (e.g. `diff-report.md`)
- 在 `decision.md` 末尾列 "Lead takeovers this round: [diff, playwright, ...]"
- **不重试 subagent** — Round 1 显示重试 0 次成功, 浪费时间
- 继续后续 phase (Phase 3.5 不等 lead takeover, 因为 PM Doc Writer 的输入是已通过的 brief/test-report/playwright-report)

## 5. 文件变更清单 (精确到 path + 行)

| 文件 | 变更类型 | 估算行数 |
|---|---|---|
| `.gitignore` | edit: 删除 `.omo/` 那一行 (line 6) | -1 |
| `.opencode/skills/team-dev-loop/SKILL.md` | rewrite: 82 → 120 lines | +38 |
| `.opencode/skills/team-dev-loop/references/loop-decision.md` | rewrite: 69 → 90 lines | +21 |
| `.opencode/skills/team-dev-loop/references/phase-prompts.md` | rewrite: 202 → 280 lines (补 5 lens + tester-diff prompts) | +78 |
| `docs/team-dev-loop.md` | rewrite: 641 → 700 lines (大段改, "7-role team → 7 task + 5 parallel" 流程图重画) | +59 |
| `.omo/round-2-plan.md` | NEW (本文件) | +490 |

**总变更**: 6 files, +685 lines, -1 line. 1 commit 推到 main.

## 6. SKILL.md 新设计 (替代当前 82 行)

```yaml
---
name: team-dev-loop
description: "7-role dev loop for THIS REPO. 7 sequential task() calls + 5 parallel review-work lenses. No team_create. Round N pre-staged at .omo/round-N/ as tracked docs. Triggers: 'team dev loop', 'dev loop', 'run dev loop', 'pick next issue', 'next round', 'do 1 round'."
---
```

(完整内容在执行时写入, 这里只列结构)

**关键章节**:
1. **Quick start** — 4 步 (读 docs/team-dev-loop.md → 读 SKILL.md → 读 phase-prompts → 读 loop-decision)
2. **What this skill does** — 8 phases 顺序, 5 lens 并行
3. **Agent architecture** — 单一 sisyphus (lead) 串行调 7 task, 1 task (tester-review) 内部 fire 5 个 run_in_background=true
4. **Execution pattern** — 伪代码 (来自 §4.1)
5. **Per-phase execution** — 1 段对每个 phase 给 1 行的 reference 到 phase-prompts.md
6. **Lead inline takeover protocol** — 4 段 (来自 §4.4)
7. **Closure sequence** — 简化为 3 步 (写 decision.md → append proposals.jsonl → git add+commit+push)
8. **Notes** — worktree, push 策略, .omo/ tracking 规则

## 7. loop-decision.md 新设计

保留: 停止条件 (硬/软), per-phase fail handling, self-judgment rules
**新增**: 
- "Lead inline takeover protocol" (来自 §4.4)
- ".omo/ file tracking policy" — 哪些文件 tracked 哪些不
- "Round number naming convention" — `.omo/round-N/`, `proposals.jsonl` append-only

**删除**:
- "Decision log" 章节里 `team_create` 相关描述 (改成简单的 "append to .omo/proposals.jsonl")
- 任何 "teamSend" "teamTask" 字样

## 8. phase-prompts.md 新设计

**保留** (顺序不变, 但去掉 team_* 引用):
- PM Triage (Phase 0)
- PM Manager (Phase 0.5)
- Architect (Phase 1)
- Dev (Phase 2, 内含 inline self-check, 不再写 dev-self-check.md)
- Playwright Tester (Phase 3c)
- PM Doc Writer (Phase 3.5)

**新增** (Round 1 缺文档但实际跑过的):
- Tester Review (Phase 3a) — 内部 fire 5 lens
- Lens Goal / QA / Code / Security / Context (5 个独立 prompt)
- Tester Diff (Phase 3b) — 实际用 plugin 自己的 diff-review-dashboard

**删除**:
- 所有 "team_send_message" / "team_task_create" / "team_shutdown_request" 引用
- "you do NOT have team_* tools" 段落 (lead 不再 team_create, subagent 也不需要这条警告)

## 9. docs/team-dev-loop.md 新设计

**章节重排** (从 641 lines → 700 lines):

1. **Overview** (10 lines) — 7-role 7-task-1-parallel-fan-out 流程图 (新画的 mermaid)
2. **Why 7 roles** (40 lines) — 保留 Round 1 的 anti-bias rationale, 加 Round 1 实战数据 (3 rescue 反而证明了 inline takeover 价值)
3. **The flow** (120 lines) — 8 phases 详解, 每 phase 1 段: 输入、产出、gate 条件、失败处理
4. **5 review-work lenses in parallel** (80 lines) — 解释为什么用 `Promise.all([5 run_in_background])` 而非 `team_create` 内 5 members
5. **Lead inline takeover** (40 lines, 新增) — 来自 §4.4
6. **File structure** (60 lines, 改) — `.omo/round-N/` 全 tracked, proposals.jsonl append-only
7. **Per-round commit pattern** (40 lines, 新增) — 1 commit/round, push 策略
8. **Cost analysis: Round 1 vs Round 2** (50 lines, 新增) — 量化 token 节省, 链接到 red/blue 对抗的证据
9. **Migration from Round 1 to Round 2** (30 lines, 新增) — 已经跑过 Round 1 不需要重跑, 只是 loop 工具升级
10. **Anti-patterns** (40 lines) — 保留 Round 1 的 "do NOT 跳过 PM Manager" 等
11. **Open questions for future rounds** (30 lines, 新增) — main context 是否会 compact, lead 是否需要 sub-slice 化

## 10. .gitignore 变更

```diff
 node_modules
 dist/
-# .opencode runtime state (per-machine, not tracked) — but .opencode/skills/ IS tracked
+# .opencode runtime state (per-machine, not tracked) — but .opencode/skills/ IS tracked
 .opencode/reviews/
 .opencode/logs/
 .opencode/cache/
 .opencode/state.json
 .opencode/magic-context/
 .playwright-mcp/
 *.tmp
-.omo/
 # Test artifacts and screenshots are ephemeral; regenerate via e2e tests
 scripts/test-review-ui/*.png
 scripts/test-review-ui/*-mock.json
```

变更: 删除 `.omo/` 这一行. `.opencode/` runtime 子目录继续 gitignored.

**为什么不单独加 `.omo/round-N/plan.md` tracked + `.omo/team/` ignored?**
- 用户决策: 全部 tracked, 简单
- 风险: `.omo/proposals.jsonl` append-only 增长, 但估算 100 rounds 也就 ~100KB, 没问题
- 风险: `.omo/round-N/diff-report.md` 包含 lead takeover note 可能含敏感信息, 但 Round 1 实践显示没有, 且 lead 自己审

## 11. 验收标准 (Decision role 用这个判 PASS/FAIL)

### 11.1 文件级
- [ ] `.gitignore` 不含 `.omo/`
- [ ] `.opencode/skills/team-dev-loop/SKILL.md` 不含 `team_create` / `team_send_message` / `team_shutdown_request` 任何字样
- [ ] `.opencode/skills/team-dev-loop/references/loop-decision.md` 不含 team_* 工具引用
- [ ] `.opencode/skills/team-dev-loop/references/phase-prompts.md` 包含 7 phase + 5 lens 全部 12 个 prompt
- [ ] `docs/team-dev-loop.md` 顶部流程图反映 "7 task + 5 parallel lens" 而非 "7 team members"
- [ ] `.omo/round-2-plan.md` (本文件) 在 git tree 中

### 11.2 行为级
- [ ] `git grep "team_create\|team_send_message\|team_shutdown_request" -- .opencode/skills/team-dev-loop/ docs/team-dev-loop.md` 返回 0 行
- [ ] `git check-ignore -v .omo/round-1/decision.md` 返回 "not ignored" (确认 tracked)
- [ ] `git check-ignore -v .opencode/reviews/test-123/state.json` 返回 "ignored by .gitignore:3 .opencode/reviews/" (确认 runtime 仍 ignored)

### 11.3 兼容性
- [ ] Round 1 跑过的所有 `.omo/round-1/*` 仍然在 main, 不被删除
- [ ] Round 1 的 `proposals.jsonl` 仍然在 main, 仍然 append-only
- [ ] worktree `work-fix-review-dashboard-effective-scope-drift` (Round 2 候选) 不受影响, 不需要 rebase

## 12. 风险与缓解

| 风险 | 概率 | 影响 | 缓解 |
|---|---|---|---|
| **5 review lens 并发占用 lead main context 太满, 触发 compaction** | 中 | 高 (compact 后 lead 失去 track) | Round 2 实际跑 1 round 验证; 如果 compact, 回退到方案 B (保留 team_create) |
| **proposals.jsonl 跨 round 累积, 历史信息不便查询** | 低 | 低 | 加 `git log --diff-filter=A -- .omo/round-N/` 索引, 必要时分文件 |
| **Lead inline takeover 没有"被 takeover" 的 audit trail** | 中 | 中 | 强制写 `.omo/round-N/lead-takeover-<role>.md` (5-10 lines, 原因 + 时间) |
| **`.omo/round-N/plan.md` 太大进 git 太慢** | 低 | 低 | Round 1 plan 25KB, 100 rounds 累积 2.5MB, 远低于 git LFS 阈值 |
| **Subagent 任务拆得不好, lead 上下文反而更乱** | 中 | 中 | phase-prompts.md 加 "如果 subagent 返回 > 5KB, 让它精简到 1-2KB 返回 summary, 完整内容写文件" |

## 13. 实施步骤 (worker hand-off checklist)

按这个顺序执行, 任何一步失败立即停:

- [ ] **Step 1**: 创建 `.omo/round-2-plan.md` (本文件已就位, 改个 state 即可)
- [ ] **Step 2**: 编辑 `.gitignore`, 删除 `.omo/` 那一行
- [ ] **Step 3**: 完整重写 `SKILL.md` (82 → 120 lines)
- [ ] **Step 4**: 完整重写 `references/loop-decision.md` (69 → 90 lines)
- [ ] **Step 5**: 完整重写 `references/phase-prompts.md` (202 → 280 lines, 补 5 lens prompts)
- [ ] **Step 6**: 完整重写 `docs/team-dev-loop.md` (641 → 700 lines)
- [ ] **Step 7**: `git add .gitignore .opencode/skills/team-dev-loop/ docs/team-dev-loop.md .omo/round-2-plan.md`
- [ ] **Step 8**: `git status` 确认 6 files staged, 没有意外的 untracked
- [ ] **Step 9**: `git commit -m "<detailed message>"`
- [ ] **Step 10**: `git push origin main` (走 main, 不走 PR — 这是基础设施重构)
- [ ] **Step 11**: `git log --oneline -3` 确认新 commit 在 main
- [ ] **Step 12**: `git check-ignore -v .omo/round-1/decision.md` 确认 tracked
- [ ] **Step 13**: `git check-ignore -v .opencode/reviews/test/state.json` 确认仍 ignored
- [ ] **Step 14**: `git grep "team_create\|team_send_message" -- .opencode/skills/team-dev-loop/ docs/team-dev-loop.md` 应返回 0 行
- [ ] **Step 15**: 用 `ctx_memory` 把方案 A 的核心决策写到 project memory, 避免未来 sessions 重复纠结

## 14. 不在本次范围但已知晓

1. **Round 2 的实际 issue** (worktree `work-fix-review-dashboard-effective-scope-drift` 在等) — Round 2 plan 完成后, 下一个 round 才是它
2. **5 review lens 的 prompt 是否需要 model 优化** — Round 1 实战 3 个 lens 跑通了, 2 个 lens 还需要调, 那是 Round 2-3 的事
3. **`.omo/` 文件多了后, find/grep 性能** — 100 rounds 后再说
4. **是否需要把 proposals.jsonl 转成 SQLite** — 1 round 1 line, 1000 rounds 才 1MB, 不需要

---

**Plan status**: DRAFT
**Awaiting**: 用户确认 (yes/no/改动) 后开始 §13 实施
**Estimated execution time**: 30-45 min (1 subagent 顺序写 5 个大文件, 加 commit + push)
