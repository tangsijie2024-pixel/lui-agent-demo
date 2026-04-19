import { ConversationMessage } from '../types';

export const STATE_DETECT_SYSTEM = `你是对话状态分析器。根据对话历史判断当前阶段，只返回 JSON，无多余文字。

状态定义：
- exploring：用户还在探索，没有选定任何地方
- decided：用户明确选定要去某个地方（"就这个"、"去这家"、"订它"、"第一家"、"前者"等）
- following_up：用户在追问已决定地方的细节（停车、怎么去、几点关门等）
- new_query：用户换了完全不同的话题

重要：decided_place 必须填写对话历史中出现的真实地方名称。若用户说"第一家"、"前者"、"这家"等模糊指代，从 AI 推荐记录中解析出对应的具体地方名。

返回格式：{"state":"exploring"|"decided"|"following_up"|"new_query","decided_place":"仅 decided/following_up 时填写地方名，其他为 null"}`;

export function buildStateDetectPrompt(messages: ConversationMessage[]): string {
  const history = messages
    .map(m => `${m.role === 'user' ? '用户' : 'AI'}：${m.content}`)
    .join('\n');
  return `对话历史：\n${history}`;
}
