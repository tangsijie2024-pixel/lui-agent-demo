import Anthropic from '@anthropic-ai/sdk';
import { UserMemory } from '../../types';
import { anthropic, MODEL } from '../../lib/anthropic';
import { buildSystemPrompt } from '../../prompts/system';
import { buildProactiveOpeningPrompt } from '../../prompts/proactive';
import { FeedSignal } from '../trigger/detectFeedSignal';

export async function generateOpening(memory: UserMemory, signal: FeedSignal): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 128,
    system: buildSystemPrompt(memory),
    messages: [{ role: 'user', content: buildProactiveOpeningPrompt(memory, signal) }],
  });

  return response.content
    .filter(b => b.type === 'text')
    .map(b => (b as Anthropic.TextBlock).text)
    .join('')
    .trim();
}
