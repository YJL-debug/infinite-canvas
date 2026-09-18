# 本地定制版维护

本 fork 基于 `basketikun/infinite-canvas`。`custom` 分支维护图片反推等自己的修改，`main` 保留上游基线。当前定制版已合并上游 v0.19.0，反推功能，使用原版 GPT-Image2-Skill 指令与按需读取的参考文件。

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
