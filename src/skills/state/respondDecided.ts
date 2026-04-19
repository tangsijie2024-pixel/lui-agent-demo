import Anthropic from '@anthropic-ai/sdk';
import { ConversationMessage, UserMemory } from '../../types';
import { anthropic, MODEL } from '../../lib/anthropic';
import { buildSystemPrompt } from '../../prompts/system';
import { buildDecidedInstruction } from '../../prompts/decided';

export async function respondDecided(
  decidedPlace: string,
  messages: ConversationMessage[],
  memory: UserMemory,
  state: 'decided' | 'following_up'
): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    system: buildSystemPrompt(memory),
    messages: [
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: buildDecidedInstruction(decidedPlace, state) },
    ],
  });

  return response.content
    .filter(b => b.type === 'text')
    .map(b => (b as Anthropic.TextBlock).text)
    .join('')
    .trim();
}
