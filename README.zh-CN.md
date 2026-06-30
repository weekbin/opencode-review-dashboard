# opencode-review-dashboard

[English](README.md) | 中文

一个跑在浏览器里的代码审查工具，给 [OpenCode](https://opencode.ai) 用。在浏览器里看 diff、写评论、标 finding，然后让 AI agent 去改代码 —— 全程不用离开编辑器。

如果你经常要 review PR 或 diff，这个工具能省掉在 GitHub 评论框里复制粘贴的麻烦。

---

## 看起来是什么样的

### 看 diff

![Dashboard 概览，左侧是文件树，右侧是渲染的 diff](docs/screenshots/dashboard-overview.png)

*改过的文件高亮，没碰过的文件淡灰色显示。*

### 加 finding 和 emoji 反应

![Finding 卡片，显示评论、类别、严重程度、emoji 反应行](docs/screenshots/r12-conversation-with-finding.png)

*点行号加 finding。一键 emoji 反应快速反馈。*

### 过滤和排序 Conversation

![Conversation tab，★ Pinned 过滤 chip、Sort 下拉、Reacted 过滤](docs/screenshots/r15-s1-conversation-pinned-sort.png)

*星标 finding 下一轮回看。按严重程度排序优先处理。*

### 在 diff 内搜索

![In-diff 搜索栏覆盖层和匹配高亮](docs/screenshots/r13-in-diff-search.png)

*`Ctrl+F`（Mac `Cmd+F`）在已加载 diff 里找任意文本。*

### 提交前确认

![Submit review 确认弹窗，显示「Submit review?」加 Cancel / Submit 按钮](docs/screenshots/r15-s4-submit-confirm.png)

*提交前的二次确认，防止误操作丢工作。*

---

## 它能做什么

**在浏览器里看 diff。** 你所有的改动（已 commit + 未 commit）都渲染在同一个页面上。没改动的区域默认折叠起来，点一下展开。还没碰过的文件是淡灰色显示，一眼就能看出改了什么。

**加 finding。** 点行号，输入评论，选类别（bug / style / performance / question / recommendation），选严重程度（high / medium / low），完事。finding 会存到 state 文件里。也可以加 file 级 finding（不绑定到具体行号），给整体反馈用。

**评论线程。** 每个 finding 可以有多条评论 —— 你和 agent 来回讨论修改方案时很有用。finding 有状态：open / resolved / stale（绑定的行跨轮次变了的话自动标 stale）。

**多轮审查。** 你提交一轮，agent 去修，然后你开始下一轮覆盖在它的修复之上。前几轮的 finding 通过专门的"Previously discussed" tab 都能看到 —— 你在 review 第 4 轮时能看到第 1 轮讨论了什么。

**AI agent 自动修复。** agent 读你的 finding，做计划，应用修复，验证。你可以在同一轮里迭代：提交，agent 应用，刷新浏览器看 diff，再加 finding 或 resolve 喜欢的。

**Worktree 自动识别。** 如果你在 git worktree 里干活，工具能自动识别你在哪个 worktree。不用传 `--worktree` 参数。

---

## 功能列表

### 看 diff

- **未改动区域可折叠** —— 长 diff 也能扫读
- **sidebar 显示改动文件数** —— 一眼看出 scope
- **支持行级 + 文件级 diff** —— 都支持
- **Diff 范围 banner** —— 范围在会话中变了（如新增未 commit 文件），顶部出现黄色 banner

### 加 finding

- **点行号** 开始一个 finding
- **选类别** —— bug / style / performance / question / recommendation
- **选严重程度** —— high / medium / low
- **加 file 级 finding** 给整体反馈（不绑定行号）
- **★ Pinned findings** *(R12 新增)* —— 星标任意 finding 标记为下一轮要回看的。Conversation tab 会出现「★ Pinned」过滤 chip 和「★N」徽章，所有星标的 finding 一目了然
- **Emoji 反应** *(R12 新增)* —— 在 finding 上点 👍 👎 😄 ❤️ 🎉 👀。一次点击 vs 打字 "lgtm"。再点同一个 emoji 撤回反应

### Review 与迭代

- **`n` / `p` 键** *(R12 新增)* —— 跳到下一个 / 上一个 finding，不用滚屏。光标不在文本框里时生效
- **In-diff 搜索** *(R13 新增)* —— 按 `Ctrl+F`（Mac 上 `Cmd+F`）打开搜索框，在已加载的 diff 里找任意文本。Enter 跳到下一个匹配，Shift+Enter 跳到上一个
- **★ Sort findings** *(R14 新增)* —— 下拉菜单按 Newest / Oldest / Severity（high → low）/ File path（A-Z）排序
- **Filter Previously-discussed by round** *(R14 新增)* —— 5 轮以上时，按 round 数字过滤历史 tab
- **★ Cmd+P 文件跳转** *(R15 新增)* —— VS Code 风格的 quick-open 面板。输入文件名直接跳过去

### 解决 finding

- **★ Resolve-with-reason 弹窗** *(R13 新增)* —— 解决 finding 时可选快速原因（Fixed / False positive / Out of scope / Wontfix）或自填。原因会保留供以后参考
- **Mark as wontfix / out-of-scope** *(R13 新增)* —— 区别于普通 Resolve。用于你认同但不打算修的 finding（已知问题、未来工作等）
- **Comments audit trail** *(R15 新增)* —— 每次编辑 finding 都会保留前一版本。评论线程会显示「X 次编辑」和前后历史

### 提交

- **Submit 确认弹窗** *(R15 新增)* —— 提交前弹「Review N findings before submitting」防误操作
- **Auto-save 指示器** *(R14 新增)* —— 头部显示「Saved 3s ago」，原地更新。不再有侵入式的「Draft saved at 12:34:56」toast

### 工作流

- **多轮审查** —— 每次提交是一轮。Finding 跨轮次延续。Stale finding（绑定的行变了）自动标记
- **Auto-apply agent** —— agent 读你的 finding，做计划，应用，验证。同轮内可迭代
- **Export** —— 把 review 存成 markdown 报告
- **Round notes** —— 每轮的全局笔记，自动导入到「Previously discussed」视图

---

## 怎么安装

1. 没装过 [OpenCode](https://opencode.ai) 的话先装上
2. 装插件（具体命令看 OpenCode 插件仓库）：
   ```bash
   opencode plugin install @weekbin/opencode-review-dashboard
   ```
3. 打开一个有 git 改动的项目
4. 在 OpenCode 对话框里输入 `/diff-review-dashboard` 回车

完事。dashboard 会在浏览器 `http://localhost:<port>` 打开。

---

## 怎么用

**典型工作流：**

1. 你在编辑器里做了一些代码改动
2. 一些 commit 了，一些没 commit —— 都没问题
3. 在 OpenCode 对话框里输入 `/diff-review-dashboard` 回车
4. 浏览器打开 review dashboard
5. 点行号加 finding，写评论，选类别和严重程度
6. 加完 finding 点「Submit Review」—— 弹窗确认
7. agent 读 finding，做计划，应用修复
8. 刷新浏览器看 agent 的 diff
9. 迭代：review agent 的改动，再加 finding，或 resolve 喜欢的
10. 整轮满意了提交，finding 延续到下一轮

**小贴士：**
- 用 ★ Pinned 标记 agent 修完后要回看的 finding
- 用 emoji 反应给快速反馈，不用写完整评论
- 用 `n` / `p` 键在 finding 间飞，不用滚屏
- 「Previously discussed」tab 累积多轮历史 —— 用 round 过滤器聚焦最近上下文

---

## 键盘快捷键

| 键 | 动作 |
|---|---|
| `n` | 下一个 finding |
| `p` | 上一个 finding |
| `Ctrl+F` / `Cmd+F` | 打开 in-diff 搜索 |
| `/` | 打开 in-diff 搜索（备选） |
| `Cmd+P` / `Ctrl+P` | 打开文件快速跳转面板 |
| `Escape` | 关闭任何打开的弹窗 / 覆盖层 |
| `Enter` | 弹窗中确认默认操作 |

---

## FAQ

**Q: 我的 review 数据存在哪儿？**
A: 项目根目录的 `state.json` 文件里。每轮还会导出一个 `round-NNN.json` 和 `round-NNN.md` 供参考。

**Q: 能 review 别人开的 PR 吗？**
A: 可以 —— 传 `--base=<branch>`（比如 `--base=main` review 相对 main 的所有改动）。dashboard 会显示那个 diff 而不是你工作区的。

**Q: review 中断了（浏览器关了、电脑死了）怎么办？**
A: 全部自动保存。下次打开 dashboard 接着来。如果 `state.json` 真的损坏了，工具会把它存为 `state.json.corrupt-<timestamp>` 然后开新 state —— 数据不丢。

**Q: 能在 git worktree 里干活吗？**
A: 可以。工具自动识别 worktree（commit 数领先 `origin/main` 最多的那个）。也可以显式传 `--worktree=<name>`。

**Q: 怎么看之前一轮讨论了什么？**
A: 点「Previously discussed」tab。用 round 过滤下拉框聚焦特定轮次。

**Q: 能 un-resolve 一个 finding 吗？**
A: 可以 —— 点 finding，把状态改回「open」，如果想可以加原因。

**Q: finding 间跳转有键盘快捷键吗？**
A: 有 —— `n`（下一个）和 `p`（上一个）。光标不在文本框时生效，所以在评论里打 `n` 和 `p` 不会触发跳转。

---

## 协议

[MIT](LICENSE)（或项目实际用的协议）

---

## 贡献

欢迎提 bug 和 PR。看 [issues](https://github.com/weekbin/opencode-review-dashboard/issues) 了解当前 backlog。
