import Anthropic from '@anthropic-ai/sdk';
import { ConversationMessage, ConversationState } from '../../types';
import { anthropic, MODEL } from '../../lib/anthropic';
import { extractJson } from '../../lib/extractJson';
import { STATE_DETECT_SYSTEM, buildStateDetectPrompt } from '../../prompts/state';

interface StateDetectResult {
  state: ConversationState;
  decided_place?: string;
}

export async function detectState(messages: ConversationMessage[]): Promise<StateDetectResult> {
  if (messages.length <= 1) return { state: 'exploring' };

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: STATE_DETECT_SYSTEM,
    messages: [{ role: 'user', content: buildStateDetectPrompt(messages) }],
  });

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as Anthropic.TextBlock).text)
    .join('');

  try {
    return extractJson<StateDetectResult>(text, 'detectState');
  } catch {
    return { state: 'exploring' };
  }
}
