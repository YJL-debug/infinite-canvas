# 图片反推规则来源

规则文件原样来自 [wuyoscar/GPT-Image2-Skill](https://github.com/wuyoscar/GPT-Image2-Skill/tree/05cb1130bba29e0fc028220376280a2e934a8041/skills/get-prompt-from-image)，固定版本 `05cb1130bba29e0fc028220376280a2e934a8041`，采用 MIT 许可证。

画布将 SKILL.md 原文交给用户选择的模型，提供只读的 read_file 工具，让模型按 Skill 指引读取 references 下的原版指南。不会预先塞入全部指南，不追加自写分析提示词、JSON 输出契约或全局聊天人设。模型按原本的 Markdown 格式输出，画布用 Markdown 解析器提取中文、英文与负面词，不补写内容。原始返回保存在反推配置的「节点信息 → JSON → metadata.content」中。

许可证保留在此目录，并随静态部署发布到 `/licenses/GPT-Image2-Skill.txt`。
