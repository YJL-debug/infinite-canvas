# 本地定制版维护

本 fork 基于 `basketikun/infinite-canvas`。`custom` 分支维护图片反推等自己的修改，`main` 保留上游基线。当前定制版已合并上游 v0.19.0；反推功能使用原版 GPT-Image2-Skill 指令与按需读取的参考文件。

生图配置的图片设置提供「随机人物 / 画风」开关，仅用于文生图。每张结果保存自己的随机候选和实际提示词，重试沿用原设定；重新从配置节点生成才会重新抽样。原提示词及引用文本中的明确要求优先于随机候选，最终效果取决于所选模型对指令的遵循情况。

图片组主图上提供「批量改图」入口：填写一次修改要求，选择「修改整组」后，每张已完成的图片分别生成一张新图，原组保留。编辑结果保存各自的原图引用，支持单张重试、切换主图、复制与刷新恢复；面板也可切回「只改主图」。

远程仓库：

- `origin`：https://github.com/YJL-debug/infinite-canvas.git
- `upstream`：https://github.com/basketikun/infinite-canvas.git

## 日常修改

在 `custom` 分支开发，检查改动后提交并推送到 `origin/custom`。模型渠道、API Key 和画布数据保存在浏览器中，不属于源码仓库。

## 获取上游更新

以下命令只获取提交并查看更新，不会修改当前代码或正在运行的容器：

```bash
git fetch upstream
git log --oneline HEAD..upstream/main
```

确认要接入某次更新后，先提交当前修改，再在独立分支合并和验证：

```bash
git switch custom
git switch -c sync/upstream-update
git merge upstream/main
```

如果有冲突，逐个处理后提交；可用 `git merge --abort` 取消尚未完成的合并。验证通过后，把该分支合并回 `custom` 并推送。下次同步请使用新的分支名称。

```bash
git switch custom
git merge --ff-only sync/upstream-update
git push origin custom
```

GitHub 的 Sync fork 可用于更新 `main`；它不会自动更新 `custom` 或本地 Docker 部署。合并源码后需重新构建才会生效。

## 当前本地部署

- 源码目录：`/home/jl/infinite-canvas/source`
- 使用中的 Compose：`/home/jl/infinite-canvas/docker-compose.yml`
- 本地镜像：`infinite-canvas:reverse-prompt`

在 `/home/jl/infinite-canvas` 中运行 `docker compose up -d --build`，会从 `source/` 当前检出的代码重新构建并更新本地服务。
