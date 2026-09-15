# Useful Skills

这里收录我在实际工作中觉得有用的 AI skills，不按类别分层；每个 skill 使用独立目录保存，方便直接复制到 Claude Code 或其他兼容 skill 规范的工具中。

## 当前收录

| Skill | 适合做什么 | 核心方法 |
| --- | --- | --- |
| [`structured-reporting`](./structured-reporting/SKILL.md) | 梳理周报、结项汇报、向上沟通、评审材料和工作总结，也可检查现有文档的结构是否清楚 | 结论先行、SCQA、MECE、观点式标题、数字与范围纪律 |
| [`deck-craft`](./deck-craft/SKILL.md) | 制作适合现场讲解的 PPT、网页演示和评审页面 | 一页一个意思、页面只留图和关键词、正确选择图表、解释放进演讲者备注 |

## 两个 skill 的分工

- `structured-reporting` 解决“说什么、按什么顺序说”。它先确定受众、目标和一句话结论，再组织完整论证。
- `deck-craft` 解决“页面上放什么、怎么让观众快速看懂”。它把完整解释留给讲述者，把页面留给视觉信息和关键词。

准备一份汇报时，可以先用 `structured-reporting` 搭结构，再用 `deck-craft` 把内容转成适合投屏讲解的页面。

## 使用方式

将需要的 skill 目录复制到项目的 `.claude/skills/` 下：

```bash
mkdir -p .claude/skills
cp -r skill/structured-reporting .claude/skills/
cp -r skill/deck-craft .claude/skills/
```

也可以复制到 `~/.claude/skills/`，供本机所有项目使用。启用后，可直接提出类似下面的请求：

- “用 structured-reporting 帮我重组这份周报。”
- “用 deck-craft 把这份汇报改成适合 15 分钟演讲的页面。”
