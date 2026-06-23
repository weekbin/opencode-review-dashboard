# @weekbin/opencode-review-dashboard

[English](README.md) | 中文

一个 [OpenCode](https://opencode.ai) 插件，提供 `/diff-review-dashboard` 斜杠命令，用于在浏览器中进行代码审查，基于 [@pierre/diffs](https://diffs.com) 渲染 diff。

命令名：`diff-review-dashboard`（工具名：`diff_review_dashboard`）。

## 截图

### Diff 审查（未改动区域可折叠展开）

![Files Changed / Diff view](docs/screenshots/diff.png)

### 添加 finding（行级或文件级）

![Adding a finding](docs/screenshots/finding.png)

### Commits 面板

![Commits list](docs/screenshots/commits.png)

### Conversation 面板（支持评论）

![Conversation](docs/screenshots/conversation.png)

---

## 功能

在 OpenCode 会话中运行 `/diff-review-dashboard` 后，插件会：

1. **收集 diff**：从 git 工作区、基准分支或指定 worktree 读取变更。
2. **启动本地 HTTP 服务器**，并在浏览器中打开审查界面。URL 也会打印到 TUI，方便手动复制。
3. **进行审查**：点击行号或文件卡片上的 + 按钮，添加 finding（分类、等级、评论）。
4. **提交后返回结构化 JSON**，供 OpenCode 处理。
5. **Agent 自动应用**可操作的 finding（见 [自动应用规则](#自动应用规则)）。

### 审查流程

```
运行 /diff-review-dashboard
    → 插件读取 git diff
    → 在 TUI 打印 review URL
    → 浏览器打开语法高亮的 diff
    → 点击行/文件添加 finding
    → 点击 "Submit Review"
    → 插件返回 JSON：{ round, open_count, by_severity, by_category, notes, findings[], artifacts }
    → Agent 自动应用可操作的 finding，然后重新运行 /diff-review-dashboard
```

### 自动应用规则

斜杠命令模板要求 Agent **不要询问用户**，提交后直接处理：

- 按等级排序：high → medium → low。
- 跳过 `category: question`（仅澄清问题）。
- **先统一规划**：Agent 先读取所有相关文件，再设计一个统一的修复计划。
- 一次性应用全部修改，然后重新运行 `/diff-review-dashboard` 确认。
- 如果 `open_count == 0` 或没有可操作 finding，输出 `Round N: no actionable items, closing out.` 并结束。

### 多轮审查

每个会话会跟踪 review 轮次。再次运行 `/diff-review-dashboard` 时，之前轮次的 finding 会保留；如果文件被删除或锚定代码发生变化，旧 finding 会自动标记为 `stale`（过期）。

### 状态与导出

审查状态持久化到 `.opencode/reviews/<session>/`：

- `state.json` — 完整会话状态
- `round-NNN.json` — 单轮 finding 快照
- `round-NNN.md` — Markdown 摘要

草稿会自动保存，关闭浏览器后重新打开不会丢失进度。

---

## 安装

将插件添加到你的 `opencode.json`（全局或项目级 `.opencode/opencode.json`）：

```json
{
  "plugin": ["@weekbin/opencode-review-dashboard"]
}
```

重启 OpenCode，`/diff-review-dashboard` 命令即可使用。

本地开发时，可使用 `file:/path/to/this/repo` 替代。

---

## 使用

查看工作区变更：

```
/diff-review-dashboard
```

对比指定分支：

```
/diff-review-dashboard --base origin/main
```

对比指定提交或范围：

```
/diff-review-dashboard --base HEAD~1
/diff-review-dashboard --base HEAD~3
```

指定 worktree（默认自动检测）：

```
/diff-review-dashboard --worktree /path/to/worktree
```

只审查指定文件（逗号分隔，无空格）：

```
/diff-review-dashboard --files src/foo.ts,src/bar.ts
```

组合使用：

```
/diff-review-dashboard --base origin/main --files src/foo.ts
```

启动后，TUI 会打印 review URL：

```
[diff-review-dashboard] review URL: http://127.0.0.1:55006/review/review_abc?token=...
```

浏览器会自动打开；如果失败，可从 TUI 复制 URL。

### worktree 解析规则

解析优先级：

1. `--worktree <path>` 显式指定
2. `context.worktree`（当前 OpenCode 会话所在的 worktree）
3. `context.directory`（会话主目录 / cwd）

第一个能解析到有效 git toplevel 的路径会被使用。同一会话的所有轮次都会固定使用该路径，确保 finding 持久化。

未指定 `--worktree` 时的自动检测：如果你在主 checkout 中，插件会列出所有 worktree，选择 ahead-of-`origin/main` 提交数最多的一个；如果你已经在某个 worktree 中，则固定使用当前 worktree。

### 提示

- 浏览器标签页 URL 是单次有效的，刷新页面无法保留。
- finding 锚定在文件 + 行号 + 代码片段上；如果后续代码变化，finding 会自动过期。
- 提交后浏览器标签页会自动关闭。

---

## 审查界面

浏览器界面分为三个区域：

- **左侧边栏**（可拖动调整宽度，宽度会保存到 localStorage）：
  - **Files Changed** — 列出所有变更文件，支持 tree/flat 切换。文件级 finding 会显示 📄 徽章。
  - **Commits** — 每个文件涉及的提交列表，含短 SHA 和提交信息。
  - **Conversation** — 所有 finding（行级/文件级），含状态徽章和按 finding 回复的评论；支持 Resolve、Remove、Reopen、Jump 操作。
- **中间 diff 卡片** — 语法高亮 diff。点击行号选择范围，点击文件卡片上的 + 按钮添加文件级 finding。大段未改动代码默认折叠，点击展开按钮每次显示 20 行。
- **Review 抽屉** — 选择分类（`bug`/`style`/`perf`/`question`/`recommend`）和等级（`high`/`medium`/`low`），填写评论后点击 "Add Finding"。底部可填写本轮整体 notes。

界面会跟随系统亮/暗模式，也可手动切换。

---

## 开发

项目最初 fork 自 [`oorestisime/opencode-diffs`](https://github.com/oorestisime/opencode-diffs)，已大幅重写，新增了 worktree 自动检测、文件级 finding、Commits/Conversation 面板、finding 评论、可拖动侧边栏、diff 折叠、自动应用工作流等。

### 脚本

| 脚本 | 作用 |
|---|---|
| `bun run build` | 打包插件（`tsdown` → `dist/plugin/index.mjs`）和 UI（`dist/ui/`），并复制 `src/ui/review.html`。 |
| `bun run prepare` | `bun install` 时自动运行，调用 `build`。 |
| `bun run lint` | 使用 [oxlint](https://oxc.rs/docs/guide/usage/linter) 检查 `src/`。 |
| `bun run format` | 使用 [oxfmt](https://oxc.rs/docs/guide/usage/formatter) 格式化 `src/`。 |
| `bun run format:check` | 检查格式，不写入。 |
| `bun run typecheck` | 使用 `tsc --noEmit` 类型检查。 |
| `bun run check` | `format:check && lint && typecheck`。 |
| `bun run prepublishOnly` | `npm publish` 前自动运行 `check + build`。 |
| `bun run test:ui` | 端到端浏览器测试（Playwright MCP），覆盖 10 个 git 场景。 |

### 本地设置

```bash
bun install
bun run check        # format:check + lint + typecheck
bun run build        # 生成 dist/
```

---

## 许可证

MIT
