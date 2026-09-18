import type { CanvasNodeData } from "@/types/canvas";
import type { ReferenceImage } from "@/types/image";

/** 保留原组顺序和原图 ID，避免主图切换后批量编辑、重试引用错图。 */
export function batchEditSources(node: CanvasNodeData): Array<ReferenceImage & { sourceIndex: number }> {
    return (node.metadata?.images || []).flatMap((image, index) =>
        image.status === "success" && (image.storageKey || image.content)
            ? [{ id: image.id, name: `${node.title || node.id}-${index + 1}.png`, type: image.mimeType, dataUrl: image.content, storageKey: image.storageKey, sourceIndex: index + 1 }]
            : [],
    );
}
