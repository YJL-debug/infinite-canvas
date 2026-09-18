import { expect, test } from "bun:test";

import { createRandomImagePrompts } from "../src/lib/canvas/random-image-prompt";

test("keeps the user's original instructions and records each sampled request", () => {
    const original = "一位黑色长发的女生，左手放在头顶，雨夜街道。";
    const plans = createRandomImagePrompts(original, 3);
    expect(plans).toHaveLength(3);
    for (const plan of plans) {
        expect(plan.prompt.startsWith(original + "\n\n")).toBe(true);
        expect(plan.prompt).toContain(plan.variation.character);
        expect(plan.prompt).toContain(plan.variation.style);
        expect(plan.prompt).toContain("冲突的候选设定应忽略");
    }
});

test("avoids consecutive repeats across batches without modifying the saved previous selection", () => {
    const previous = createRandomImagePrompts("一个人", 1)[0].variation;
    const saved = { ...previous };
    const plans = createRandomImagePrompts("一个人", 15, previous);
    let last = previous;
    for (const plan of plans) {
        expect(plan.variation.character).not.toBe(last.character);
        expect(plan.variation.style).not.toBe(last.style);
        last = plan.variation;
    }
    expect(previous).toEqual(saved);
    expect(JSON.parse(JSON.stringify(plans))).toEqual(plans);
});
