import { nanoid } from "nanoid";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toString } from "mdast-util-to-string";
import { NODE_DEFAULT_SIZE } from "@/constant/canvas";
import { createCanvasNode } from "@/lib/canvas/canvas-node-factory";
import type { AiConfig } from "@/stores/use-config-store";
import { CanvasNodeType, type CanvasConnection, type CanvasNodeData } from "@/types/canvas";

type ReversePromptResult = { positiveChinese: string; positiveEnglish: string; negativeEnglish: string };
type MarkdownNode = { type: string; children?: MarkdownNode[] };

export function parseReversePrompt(answer: string): ReversePromptResult {
    const blocks = (node: MarkdownNode): string[] =>
        node.type === "heading" || node.type === "paragraph" ? [toString(node)] : (node.children || []).flatMap(blocks);
    const text = blocks(fromMarkdown(answer)).join("\n\n");
    // 只拆分 Skill 原本要求的三个部分，不让模型为画布改写输出，也不补写缺失内容。
    const parts = text.match(/(?:^|\n)Chinese:\s*([\s\S]+?)\n+English:\s*([\s\S]+?)\n+(?:2[.)]\s*)?Negative Prompt:?\s*\n+([\s\S]+)$/i);
    if (!parts || parts.slice(1).some((part) => !part.trim())) {
        throw new Error("模型未按原 Skill 输出 Chinese、English 和 Negative Prompt，原始返回已保存在反推配置的节点信息中。");
    }
    return { positiveChinese: parts[1].trim(), positiveEnglish: parts[2].trim(), negativeEnglish: parts[3].trim() };
}

export function createReversePromptOutputs(source: CanvasNodeData, result: ReversePromptResult, imageConfig: AiConfig, analysisConfig: AiConfig) {
    const gap = 96;
    const textSize = NODE_DEFAULT_SIZE[CanvasNodeType.Text];
    const configSize = NODE_DEFAULT_SIZE[CanvasNodeType.Config];
    const x = source.position.x + source.width + gap + textSize.width / 2;
    const y = source.position.y + source.height / 2;
    const prompts = [
        ["中文提示词 · 可编辑", result.positiveChinese],
        ["负面词 · 避免出现", result.negativeEnglish],
        ["英文提示词 · 备用版本", result.positiveEnglish],
    ];
    const textNodes = prompts.map(([title, content], index) => ({
        ...createCanvasNode(CanvasNodeType.Text, { x, y: y + index * (textSize.height + gap) }, { content, status: "success", fontSize: 14, model: analysisConfig.model, reasoningEffort: analysisConfig.reasoningEffort }),
        title,
    }));
    const [positive, negative] = textNodes;
    // 生图只引用可编辑节点，避免将反推时的快照或原图悄悄带入下一次生成。
    // 英文版本独立保留；负面词明确作为排除要求，不作为期望出现的画面内容。
    const imageNode = {
        ...createCanvasNode(CanvasNodeType.Config, { x: x + textSize.width / 2 + gap + configSize.width / 2, y }, {
            generationMode: "image",
            model: imageConfig.model,
            size: imageConfig.size,
            quality: imageConfig.quality,
            background: imageConfig.background,
            count: Number(imageConfig.canvasImageCount || imageConfig.count),
            composerContent: `根据以下正向提示词生成图片：\n@[node:${positive.id}]\n\n请避免以下内容、风格和缺陷：\n@[node:${negative.id}]`,
        }),
        title: "用反推提示词生图",
    };
    const connections: CanvasConnection[] = [
        ...textNodes.map((node) => ({ id: nanoid(), fromNodeId: source.id, toNodeId: node.id })),
        ...[positive, negative].map((node) => ({ id: nanoid(), fromNodeId: node.id, toNodeId: imageNode.id })),
    ];
    return { nodes: [...textNodes, imageNode], connections, imageNode };
}
