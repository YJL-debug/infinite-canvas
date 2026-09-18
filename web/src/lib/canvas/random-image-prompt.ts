import type { RandomImageVariation } from "@/types/canvas";

const styles = [
    "写实摄影：自然肤质、真实镜头与光照",
    "日系动画：清晰线稿、赛璐璐上色",
    "3D 动画：立体角色、柔和的三维渲染",
    "水彩插画：透明色层、纸张纹理与柔软边缘",
    "美式漫画：有力线条、网点与鲜明色块",
    "黏土定格：手工黏土质感、微缩布景",
    "水墨插画：墨色层次、笔触与留白",
    "平面插画：简洁几何形状、干净配色",
];
const characters = [
    "成年女性，鹅蛋脸，黑色波浪长发，休闲针织穿搭",
    "成年男性，方脸，黑色短发，简约衬衫穿搭",
    "成年女性，圆脸，棕色短卷发，运动风穿搭",
    "成年男性，长脸，棕色卷发，休闲夹克穿搭",
    "成年女性，棱角分明的脸型，银色短发，利落外套",
    "成年男性，圆脸，黑色中长发，宽松毛衣穿搭",
    "成年女性，长脸，红棕色马尾，简约日常穿搭",
    "成年男性，鹅蛋脸，浅金色短发，轻便风衣穿搭",
];

function pickDifferent(values: string[], previous?: string) {
    const choices = values.filter((value) => value !== previous);
    return choices[Math.floor(Math.random() * choices.length)];
}

/** 每张图预先记录抽样结果，让失败重试和批量切换仍对应同一份实际请求。 */
export function createRandomImagePrompts(prompt: string, count: number, previous?: RandomImageVariation) {
    return Array.from({ length: count }, () => {
        const variation = { character: pickDifferent(characters, previous?.character), style: pickDifferent(styles, previous?.style) };
        previous = variation;
        return {
            variation,
            prompt: `${prompt}\n\n【本次随机设定】\n人物候选：${variation.character}\n画风候选：${variation.style}\n这些候选只补充原提示词未指定的内容。原提示词及其引用文本中的人物、性别、年龄、外貌、服装、动作、场景、数量和画风始终优先；冲突的候选设定应忽略。原场景没有人物时，不要额外添加人物。生成一张完整图片，不要拼图，也不要把这些说明画成文字。`,
        };
    });
}
