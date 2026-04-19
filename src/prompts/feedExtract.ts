import { ConversationMessage } from '../types';

export const FEED_EXTRACT_SYSTEM = `你是用户情绪状态分析器。
从用户最近的对话消息里提取情绪信号，只关注用户说的话，忽略 AI 回复。
只返回 JSON，无多余文字。

mood 只能是以下之一：restless（无聊/想动）/ tired（疲惫/想放松）/ social（想社交）/ exploring（想探索新地方）/ neutral（无明显信号）

返回格式：
{
  "recent_signals": ["最多3个情绪关键词，直接摘自用户消息"],
  "mood": "restless|tired|social|exploring|neutral"
}`;

export function buildFeedExtractPrompt(messages: ConversationMessage[]): string {
  const userMessages = messages
    .filter(m => m.role === 'user')
    .slice(-3)
    .map(m => `- ${m.content}`)
    .join('\n');

  return `用户最近说的话：\n${userMessages}\n\n请提取情绪状态。`;
}
