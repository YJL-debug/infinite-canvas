import { expect, test } from "bun:test";

import { batchEditSources } from "../src/lib/canvas/batch-image-edit";
import { CanvasNodeType, type CanvasNodeData, type CanvasNodeImage } from "../src/types/canvas";

test("edits only completed images in source order regardless of the selected primary or generation count", () => {
    const image = (id: string, patch: Partial<CanvasNodeImage> = {}): CanvasNodeImage => ({ id, status: "success", content: "", naturalWidth: 1024, naturalHeight: 1024, bytes: 100, mimeType: "image/png", ...patch });
    const node: CanvasNodeData = { id: "group", type: CanvasNodeType.Image, title: "Group", position: { x: 0, y: 0 }, width: 300, height: 300, metadata: { count: 10, primaryImageId: "last", images: [image("first", { storageKey: "image:first" }), image("failed", { status: "error" }), image("pending", { status: "loading" }), image("empty"), image("last", { content: "https://example.test/last.png" })] } };
    const before = JSON.stringify(node);
    const sources = batchEditSources(node);
    expect(sources.map(({ id, sourceIndex }) => ({ id, sourceIndex }))).toEqual([{ id: "first", sourceIndex: 1 }, { id: "last", sourceIndex: 5 }]);
    expect(sources[0].storageKey).toBe("image:first");
    expect(sources[1].dataUrl).toBe("https://example.test/last.png");
    expect(JSON.stringify(node)).toBe(before);
});
