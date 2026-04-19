import Anthropic from '@anthropic-ai/sdk';
import { UserMemory, ParsedIntent } from '../../types';
import { anthropic, MODEL } from '../../lib/anthropic';
import { extractJson } from '../../lib/extractJson';
import { buildSystemPrompt } from '../../prompts/system';
import { buildIntentPrompt } from '../../prompts/intent';

export async function parseIntent(query: string, memory: UserMemory): Promise<ParsedIntent> {
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 512,
    system: buildSystemPrompt(memory),
    messages: [{ role: 'user', content: buildIntentPrompt(query) }],
  });

  const message = await stream.finalMessage();
  const text = message.content
    .filter(b => b.type === 'text')
    .map(b => (b as Anthropic.TextBlock).text)
    .join('');

  return extractJson<ParsedIntent>(text, 'parseIntent');
}
