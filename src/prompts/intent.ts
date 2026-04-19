export function buildIntentPrompt(query: string): string {
  return `用户说："${query}"

请从这句话中提取三层意图，只返回 JSON，不要有任何多余的文字：

{
  "instant": "物理空间需求，用户想去哪种地方或做什么",
  "context": "情境判断，包含时间、状态、同行人等",
  "deep": "心理补偿需求，用户真正想要的感受是什么"
}`;
}
