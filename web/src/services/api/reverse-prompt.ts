import type { AiConfig } from "@/stores/use-config-store";
import { requestTextWithTools, type AiTextMessage, type ResponseInputMessage, type ResponseFunctionTool } from "./image";
import skill from "@/lib/prompts/get-prompt-from-image/SKILL.md?raw";
import framework from "@/lib/prompts/get-prompt-from-image/references/analysis-framework.md?raw";
import categories from "@/lib/prompts/get-prompt-from-image/references/category-guides.md?raw";
import illustration from "@/lib/prompts/get-prompt-from-image/references/illustration-style.md?raw";

const referenceFiles: Record<string, string> = {
    "references/analysis-framework.md": framework,
    "references/category-guides.md": categories,
    "references/illustration-style.md": illustration,
};
const readFileTool: ResponseFunctionTool = {
    type: "function",
    function: {
        name: "read_file",
        description: "Read a reference file linked from the Skill. Paths are relative to the Skill directory.",
        parameters: { type: "object", properties: { path: { type: "string", enum: Object.keys(referenceFiles) } }, required: ["path"], additionalProperties: false },
        strict: true,
    },
};

export async function requestReversePrompt(config: AiConfig, messages: AiTextMessage[], signal: AbortSignal): Promise<string> {
    if (!messages.some((message) => Array.isArray(message.content) && message.content.some((part) => part.type === "image_url"))) {
        throw new Error("反推需要一张已连接的图片，请检查图片连线后重新生成。");
    }
    // 由模型遵照原 Skill 按需读取指南，避免把插画规则预先混入摄影任务。
    // 通用聊天人设和画布自写的输出要求不参与这项任务。
    const history: ResponseInputMessage[] = [{ role: "system", content: skill }, ...messages];
    for (;;) {
        signal.throwIfAborted();
        const result = await requestTextWithTools({ ...config, systemPrompt: "" }, history, [readFileTool], { signal });
        signal.throwIfAborted();
        if (!result.toolCalls.length) {
            if (!result.content.trim()) throw new Error("反推模型未返回内容。");
            return result.content;
        }
        for (const call of result.toolCalls) {
            const args: unknown = JSON.parse(call.function.arguments);
            if (call.function.name !== "read_file" || !args || typeof args !== "object" || !("path" in args) || typeof args.path !== "string" || !Object.hasOwn(referenceFiles, args.path)) {
                throw new Error("模型请求的文件不属于当前 Skill 的参考文件。");
            }
            history.push({ type: "function_call", call_id: call.id, name: call.function.name, arguments: call.function.arguments, thoughtSignature: call.thoughtSignature });
            history.push({ role: "tool", tool_call_id: call.id, content: referenceFiles[args.path] });
        }
    }
}
