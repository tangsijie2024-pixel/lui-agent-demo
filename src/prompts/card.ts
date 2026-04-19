import { Place, ParsedIntent } from '../types';

export function buildCardPrompt(place: Place, intent: ParsedIntent): string {
  return `你要为下面这个地方生成两句个性化文案。

地点信息：
${JSON.stringify(place, null, 2)}

用户的三层意图：
- 表层需求：${intent.instant}
- 情境：${intent.context}
- 深层心理需求：${intent.deep}

要求：
1. vibe_text：像朋友发微信，口语化，带点幽默，长短自然，不要鸡汤和文艺腔。例："懂你，今晚就适合这种 🥃" 而非 "在喧嚣中找到那片属于自己的宁静"
2. cta：1句自然口语，帮忙查位子、问要不要去、给个小细节都行，说够为止，不要感叹号堆砌

只返回 JSON，不要其他任何文字：
{
  "vibe_text": "...",
  "cta": "..."
}`;
}
